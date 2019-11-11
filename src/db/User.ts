import { BaseApi } from "./Utils";
import { Database } from "./database";
import { IUser, User } from "../entity/User";
import { ILogin, Login } from "../entity/Login";
import { IApiContext } from "../api/api";
import { Perm } from "../ValidationDecorator";
import { getConnection } from "typeorm";
import { Permission } from "../entity/Permission";
const bcrypt = require('bcrypt');

export class UserApi extends Database implements BaseApi<IUser> {

    public addNew(ctx: IApiContext, data: Partial<IUser>) {
        throw new Error("Method not implemented.");
    }

    @Perm(0)
    public async unlock(ctx: IApiContext, data: Partial<IUser> & {id: number}) {
        let user = await getConnection().manager.getRepository(User).findOne({id: data.id});
        user.active = true;
        getConnection().manager.save(user);
    }

    public async register(data: Partial<IUser & ILogin>) {
        let us = await getConnection().manager.getRepository(User).findOne({
            where: {
                loginName: data.loginName
            }
        });
        if(us) return false;
        let user = new User();
        user.avatarId = data.avatarId || 0;
        user.loginName = data.loginName;

        let login = new Login();
        // hash password
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(data.hash, salt);

        login.hash = hash;
        user.login = login;
        user.active = true;
        let permission = await getConnection().manager.getRepository(Permission).findOne({where: {id: 20}})
        if(!permission) { // if this permission does not exist, create it
            permission = new Permission();
            permission.id = 20;
            permission.permissionName = "user";
            await getConnection().manager.save(permission);
        }

        let queryResult = await getConnection().createQueryBuilder()
            .insert()
            .into(Login)
            .values({
                ...login
            })
            .execute();

        let loginId = queryResult.identifiers[0].id; // getLoginId from result



        user.permission = permission;
        let i = await getConnection().createQueryBuilder()
            .insert()
            .into(User)
            .values({
                ...user,
                login: loginId
            })
            .execute();
        // let userId = i.identifiers[0].id; // get userId

        return true;
        
    }

    @Perm(20)
    public async getById(ctx: IApiContext, userId: number) {
        let res = await getConnection().manager.getRepository(User).findByIds([userId], {relations: ["permission"]});
        return res[0];
    }

    @Perm(20)
    public async get(ctx: IApiContext, data: {pagesize: number, page: number}) {
        let res = await getConnection().manager.getRepository(User).find({relations: ["permission"], take: data.pagesize, skip: data.pagesize * data.page});
        return res;
    }


    // id is userid and session is session string
    public async validate(ctx, data: {id: number, session: string}) {
        let {id, session} = data;
        let user = await getConnection().manager.getRepository(User).findOne({id: id}, {relations: ["login", "permission"]});
        if(!user) return {error: "Invalid session", code: 0}; // tell user the session is not valid instead of the user does not exist
        if(!user.active) return {error: "Your account must be marked as active!", code: 1}; // only when user is set to active

        return session === user.login.session ? user : {error: "Invalid session", code: 0};
        
    }

    public put(ctx: IApiContext, data: Partial<IUser>) {
        
    }

    public delete(ctx: IApiContext, data: Partial<IUser>) {
        throw new Error("Method not implemented.");
    }


}
