import * as _ from "lodash";
import { BurgerKrigApi } from "./api";


import * as Hapi from "hapi";
import * as Boom from "boom";

interface Req {
    
    path: string;
    session?: string;
    userId: number;
    data: {
        [key: string]: any;
    };
    
}


export class Application{
    private server: Hapi.Server;

    constructor(config: Hapi.ServerOptions, private burgerKrigApi: BurgerKrigApi) {
        this.server = new Hapi.Server(config);
    
        this.server.events.on("response", function(request) {
            if(["/register", "/login"].includes(request.path) && request.method !== "options") {
                (request.payload as any).data.hash = "------------";
            }
            console.log(`${request.method}:[${request.path}]:${JSON.stringify(request.payload)}`);
        });

        this.registerEndpoint({
            method: ["OPTIONS"],
            path: "/{any*}",
            options: {
                auth: false
            },
            handler: (request, h) => {
                const response = h.response("success");
                response.header("Access-Control-Allow-Headers", "content-type");
                response.header("Access-Control-Allow-Methods", "POST");
                return response;
            }
        });

        this.registerEndpoint({
            method: ["GET", "POST", "DELETE", "PUT"],
            path: "/{any*}",
            handler: (request: any, h) => {
                const url = request.server.info.protocol
                + "://" 
                + request.info.host 
                + request.url.path;
                return Boom.notFound(`Ressource on ${url} was not found!`);
            }
        });

        this.registerEndpoint({
            method: "POST",
            path: "/login",
            handler: async (request, h) => {
                let { payload } = request as any;
                let res = await burgerKrigApi.api.login.login({...payload.data})
                return {
                    data: {
                        ...res
                    },
                    status: 200,
                    message: "OK"
                }
            }
        });

        this.registerEndpoint({
            method: "GET",
            path: "/help",
            handler: (request, h) => {
                let arr = [];
                for(let key in burgerKrigApi.api) {
                    for(let ke in burgerKrigApi.api[key]) {
                        arr.push(`${key}.${ke}`);
                    }
                }
                return arr;
            }
        })

        this.registerEndpoint({
            method: "POST",
            path: "/register",
            handler: async (request: any, h) => {
                let payload: Req = request.payload as any;
                let re = await burgerKrigApi.api.user.register({...payload.data});
                return {
                    status: 200,
                    message: "OK",
                    data: re
                };
            }
        });

        this.registerEndpoint({
            method: "POST",
            path: "/rpc",
            handler: async (request: any, h) => {
                let payload: Req = request.payload;
                let user = await burgerKrigApi.api.user.validate({id: payload.userId, session: payload.session})

                if(user.error) {
                    throw Boom.forbidden(user.error);
                }
                if(_.get(burgerKrigApi.api, payload.path)) {
                    let temp = await _.get(burgerKrigApi.api, payload.path)({session: payload.session, user}, payload.data);
                    let newSession = await burgerKrigApi.api.login.updateSession({
                        id: payload.userId,
                        session: payload.session,
                    });

                    return {
                        userId: newSession.userId,
                        session: newSession.session,
                        data: temp,
                    }
                } else {
                    throw Boom.badRequest("Method not found");
                }
            }
        })

    }

    public registerEndpoint(route: Hapi.ServerRoute | Hapi.ServerRoute[]) {
        this.server.route(route);
    }

    public start() {
        this.server.start();
        console.log("Ok");
    }
}
