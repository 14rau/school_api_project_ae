import { LoginApi } from "../db/Login";
import { UserApi } from "../db/User";
import { IUser } from "../entity/User";
import { PermissionApi } from "../db/Permission";
import { GamedataApi } from "../db/Gamedata";

export interface IApiContext{
    user: IUser;
    session: string;
}


export class BurgerKrigApi {
    private loginApi: LoginApi;
    private userApi: UserApi;
    private permissionApi: PermissionApi;
    private gamedataApi: GamedataApi;
    public api;

    public async init() {

        this.loginApi = new LoginApi();
        this.userApi = new UserApi();
        this.permissionApi = new PermissionApi();
        this.gamedataApi = new GamedataApi();

        this.api = {
            login: {
                // has to be like this, since the function wont have access to "this"
                updateSession: (ctx, data) =>  this.loginApi.updateSession(ctx, data),
                logout: (ctx, data) => this.loginApi.logout(ctx),
                registerApiKey: (ctx, data) =>  this.loginApi.registerApiKey(ctx, data),
                login: (ctx, data) =>  this.loginApi.login(ctx, data)
            },
            user: {
                validate: (ctx, data) =>  this.userApi.validate(ctx, data),
                getById: (ctx, data) => this.userApi.getById(ctx, data),
                get: (ctx, data) => this.userApi.get(ctx, data),
                unlock: (ctx, data) => this.userApi.unlock(ctx, data),
                register: (data) => this.userApi.register(data),
                getHighscoreList: (ctx, data) => this.userApi.getHighscoreList(ctx),
                setAvatar: (ctx, data) => this.userApi.setAvatar(ctx, data),
                chat: (ctx, data) => this.userApi.chat(ctx, data),
                search: (ctx, data) => this.userApi.search(ctx, data),
                getPointrank: (ctx, data) => this.userApi.getPointrank(ctx),
                setActive: (ctx, data) => this.userApi.setActive(ctx, data),
                setPermission: (ctx, data) => this.userApi.setPermission(ctx, data),
                deleteData: (ctx, data) => this.userApi.deleteData(ctx, data),
                toggleBan: (ctx, data) => this.userApi.toggleBan(ctx, data),
                addTicket: (ctx, data) => this.userApi.addTicket(ctx, data),
                getTickets: (ctx, data) => this.userApi.getTickets(ctx, data),
                

            },
            permission: {
                getPermission: (ctx, data) => this.permissionApi.getPermission(ctx, data),
                get: (ctx, data) => this.permissionApi.get(ctx)
            },
            gamedata: {
                addNew: (ctx, data) => this.gamedataApi.addNew(ctx, data),
            },

        }
    }

}