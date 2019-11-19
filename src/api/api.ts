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
                updateSession: this.loginApi.updateSession,
                logout: this.loginApi.logout,
                registerApiKey: this.loginApi.registerApiKey,
                login: this.loginApi.login
            },
            user: {
                validate: this.userApi.validate,
                getById: this.userApi.getById,
                get: this.userApi.get,
                unlock: this.userApi.unlock,
                register: this.userApi.register,
                getHighscoreList: this.userApi.getHighscoreList,
                setAvatar: this.userApi.setAvatar,
                chat: this.userApi.chat,
                search: this.userApi.search,
                getPointrank: this.userApi.getPointrank
            },
            permission: {
                getPermission: this.permissionApi.getPermission,
                get: this.permissionApi.get
            },
            gamedata: {
                addNew: this.gamedataApi.addNew,
                user: this.gamedataApi.test,
                admin: this.gamedataApi.adminFunction,
                root: this.gamedataApi.rootFunction
            },

        }
    }

}