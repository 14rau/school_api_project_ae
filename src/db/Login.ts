import { BaseApi } from "./Utils";
import { Database } from "./database";
import { IUser, User } from "../entity/User";
import { ILogin, Login } from "../entity/Login";
import * as md5 from "md5";
import { getConnection } from "typeorm";
import { IApiContext } from "../api/api";
import { Perm } from "../ValidationDecorator";
import { Permission } from "../entity/Permission";
import Boom = require("boom");
// import { streamMessage } from "../api/socket";
const bcrypt = require('bcrypt');

export class LoginApi extends Database implements BaseApi<ILogin> {

    public addNew(data) {
        
    }

    public put(data: Partial<IUser>) {
        
    }

    public delete(data: Partial<IUser>) {
        
    }

    @Perm(0)
    public async registerApiKey(ctx: IApiContext, data: Partial<IUser & ILogin>) {
        let us = await getConnection().manager.getRepository(User).findOne({
            where: {
                loginName: data.loginName
            }
        });
        // if user was found, return, since we don't want doubles
        if(us) return false;
        let user = new User();
        user.avatarId = data.avatarId || 0;
        user.loginName = data.loginName;
        data.hash = Math.random().toString(36).substring(7);

        let login = new Login();
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(data.hash, salt);
        login.hash = hash;
        user.login = login;
        user.active = false;
        let permission = await getConnection().manager.getRepository(Permission).findOne({where: {id: 20}});
        if(!permission) { // if this permission does not exist, create it
            permission = new Permission();
            permission.id = 20;
            permission.permissionName = "user";
            await getConnection().manager.save(permission);
        }

        try {
            user.permission = permission;
            await getConnection().manager.save([user, login]);
        } catch (err) {
            console.log(err);
        }

        try {
            let ret =  await this.login({loginName: data.loginName, hash: data.hash}, -1);
            return ret;
        } catch (err) {
            console.error(err);
            throw Boom.internal();
        }

    }

    public async logout(ctx: IApiContext) {
        let user = await getConnection().getRepository(User).findOne({id: ctx.user.id}, {relations: ["login"]});
        getConnection().getRepository(Login).update({session: user.login.session}, {session: null, sessionCreated: null, ttl: null});
        return {};
    }

    public async login(data: Partial<IUser & ILogin>, ttl?) {
        ttl = ttl || 1000 * 60 * 60 * 24;
        let user = await getConnection().getRepository(User).findOne({
            where: {
                loginName: data.loginName
            },
            relations: ["login", "permission"]
        });

        if(!user) return {session: "", data:{error: "Username or Password invalid"}};

        if(user.isBanned) return {session: "", data:{error: "Account banned!"}}
        let res = await bcrypt.compare(data.hash, user.login.hash)
        if(res) {
            let login = await getConnection().getRepository(Login).findOne({
                where: {
                    id: user.login.id
                }
            });
            let rand = Math.random().toString(36).substring(7);
            login.session = md5(rand);
            login.sessionCreated = new Date();
            login.ttl = ttl; //1day
            getConnection().manager.save(login);
            return {session: login.session, userId: login.id, userName: user.loginName, avatarId: user.avatarId, permissionId: user.permission.id};
        } else {
            return {session: "", data:{error: "Username or Password invalid"}};
        }
    }

    
    public async updateSession(ctx, data: Partial<IUser & ILogin>) {
        let user = await getConnection().getRepository(User).findOne({
            where: {
                id: data.id
            },
            relations: ["login", "permission"],
        });

        if(!user) return { session: "" };

        if(user.login.ttl === -1) {
            return { session: data.session, userId: data.id, permissionId: user.permission.id };        
        }

        let session;
        if((user.login.session === data.session) && (user.login.ttl === -1 || (new Date(user.login.sessionCreated).getTime() - new Date().getTime()) <= user.login.ttl)) {
            if(user.login.ttl - ((new Date(user.login.sessionCreated).getTime() - new Date().getTime())) <= user.login.ttl / 2) {
                session = md5(Math.random().toString(36).substr(7));
                user.login.session = session;
                user.login.sessionCreated = new Date();
                user.login.ttl = 1000*60*60*24; // 1 day
                getConnection().manager.save(user.login);
            } else {
                return { session: data.session, userId: data.id, permissionId: user.permission.id };   
            }
            
        } else {
            user.login.session = null;
            user.login.ttl = null;
            user.login.sessionCreated = null;
            getConnection().manager.save(user.login);
            
        }

        return { session: session, userId: data.id, permissionId: user.permission.id };
    }

}
