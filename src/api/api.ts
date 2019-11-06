import { LoginApi } from "../db/Login";
import { UserApi } from "../db/User";
import { IUser } from "../entity/User";
import { PermissionApi } from "../db/Permission";
import { GamedataApi } from "../db/Gamedata";
import { Connection } from "typeorm";

export interface IApiContext{
    user: IUser;
    session: string;
}

interface IApi {
    login: {
        updateSession: Function;
        login: Function;
    },
    user: {
        register: Function;
        validate: Function;
    },
    permission: {
        getPermission: Function;
    }
    gamedata: {
        addNew: Function;
        test: Function;
    }
}

export class BurgerKrigApi {
    private loginApi: LoginApi;
    private userApi: UserApi;
    private permissionApi: PermissionApi;
    private gamedataApi: GamedataApi;
    public api: IApi;

    public async init() {

        this.loginApi = new LoginApi();
        this.userApi = new UserApi();
        this.permissionApi = new PermissionApi();
        this.gamedataApi = new GamedataApi();

        this.api = {
            login: {
                updateSession: this.loginApi.updateSession,
                login: this.loginApi.login
            },
            user: {
                register: this.userApi.register,
                validate: this.userApi.validate
            },
            permission: {
                getPermission: this.permissionApi.getPermission
            },
            gamedata: {
                addNew: this.gamedataApi.addNew,
                test: this.gamedataApi.test
            }
        }
    }

}