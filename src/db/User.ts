import { BaseApi } from "./Utils";
import { Database } from "./database";
import { IUser, User } from "../entity/User";
import { ILogin, Login } from "../entity/Login";
import { IApiContext } from "../api/api";
import { Validate } from "../ValidationDecorator";
import { getConnection } from "typeorm";
import { Permission } from "../entity/Permission";
const bcrypt = require('bcrypt');

export class UserApi extends Database implements BaseApi<IUser> {

    public addNew(ctx: IApiContext, data: Partial<IUser>) {
        throw new Error("Method not implemented.");
    }

    public async register(data: Partial<IUser & ILogin>) {
        let us = await getConnection().manager.getRepository(User).findOne({
            where: {
                loginName: data.loginName
            }
        })
        if(us) return false;
        let user = new User();
        user.avatarId = data.avatarId || 0;
        user.loginName = data.loginName;

        let login = new Login();
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(data.hash, salt);
        login.hash = hash;
        user.login = login;
        user.active = false;
        let permission = await getConnection().manager.getRepository(Permission).findOne({where: {id: 20}})
        if(!permission) { // if this permission does not exist, create it
            permission = new Permission();
            permission.id = 20;
            permission.permissionName = "user";
            getConnection().manager.save(permission);
        }

        user.permission = permission;
        getConnection().manager.save(login);
        getConnection().manager.save(user);
        return true;
        
    }

    @Validate(20)
    public async get(ctx: IApiContext, userId: number) {
        let res = await getConnection().manager.getRepository(User).findByIds([userId]);
        delete res[0].login;
        return res[0];
    }

    // id is userid and session is session string
    public async validate(data: {id: number, session: string}) {
        let {id, session} = data;
        let user = await getConnection().manager.getRepository(User).findOne({id: id}, {relations: ["login"]});
        if(!user) return {error: "Invalid session"}; // tell user the session is not valid instead of the user does not exist
        if(!user.active) return {error: "Your account must be marked as active!"}; // only when user is set to active
        return session === user.login.session ? user : {error: "Invalid session"};
        
    }

    public put(ctx: IApiContext, data: Partial<IUser>) {
        
    }

    public delete(ctx: IApiContext, data: Partial<IUser>) {
        throw new Error("Method not implemented.");
    }


}