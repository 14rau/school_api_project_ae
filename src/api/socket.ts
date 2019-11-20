import * as io from "socket.io";
import { getConnection } from "typeorm";
import { User } from "../entity/User";


export class SocketServer {
    clients = new Map(); // clients where we will stream the events to
    server: io.Server;
    constructor() {
        this.server = io.listen(require("../../apiconfig").eventStreamPort);

        this.server.use(async (socket, next) => {
            try {
                var handshakeData = socket.request;
                // translate session to userid
                getConnection().createQueryBuilder()
                let session = handshakeData._query['session'];
                let id = handshakeData._query['id'];
    
                let user = await getConnection().getRepository(User).findOne({
                    relations: ["login"],
                    where: {
                        id
                    }
                });
                if(user.login && user.login.session === session) {
                    this.clients.set(socket.id, {userId: user.id, socket})
                    socket.emit("data", {message: "Connected to chat-application v0"});
                } else {
                    socket.emit("data", {message: "Coldnt connect, session might be expired"});
                }
            } catch(err) {
                socket.emit("data", {message: "Could not connect to the Chat-Server. Please refresh the page"})
            }

            next();
          });
        
        this.server.on("connection", (socket) => {
            socket.on("disconnect", () => {
                this.clients.delete(socket.id);
            })
        });

    }
    
    
    public streamMessage(message: string, options?: {to?: number | number[], username?: string, perm?: number}) {
        const emit = (client) => {
            let now = new Date();
                client.emit("data", {message: `[${now.getHours()}:${now.getMinutes()}]${options && options.username ? options.username : "SERVER"}: ${message}`, perm: options && options.username ? options.perm : 0 });
        }

        if(options && options.to) {
            if(!Array.isArray(options.to)) options.to = [ options.to ]
            this.clients.forEach(e => {
                if((options.to as any[]).includes(e.userId)){
                    emit(e.socket);
                }
            })
        } else {
            this.clients.forEach(e => {
                emit(e.socket);
            });
        }
    }

}
