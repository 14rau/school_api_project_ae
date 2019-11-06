import { BaseApi } from "./Utils";
import { Database } from "./database";
import { IUser, User } from "../entity/User";
import { ILogin, Login } from "../entity/Login";
import * as md5 from "md5";
import { Permission } from "../entity/Permission";
import { getConnection } from "typeorm";

export class LoginApi extends Database implements BaseApi<ILogin> {

    public addNew(data) {
        
    }

    public put(data: Partial<IUser>) {
        
    }

    public delete(data: Partial<IUser>) {
        
    }

    public async login(data: Partial<IUser & ILogin>) {
        let user = await getConnection().getRepository(User).findOne({
            where: {
                loginName: data.loginName
            },
            relations: ["login", "permission"]
        });

        if(!user) return {session: "", error: "Username or Password invalid"};

        if(user.login.hash === data.hash) {
            let login = await getConnection().getRepository(Login).findOne({
                where: {
                    id: user.login.id
                }
            });
            let rand = Math.random().toString(36).substring(7);
            login.session = md5(rand);
            login.sessionCreated = new Date();
            login.ttl = 1000 * 60 * 60 * 24; //1day
            getConnection().manager.save(login);
            return {session: login.session, userId: login.id, userName: user.loginName, permissionName: user.permission.permissionName, avatarId: user.avatarId};
        }
        return {session: "", error: "Username or Password invalid"};
    }

    
    public async updateSession(data: Partial<IUser & ILogin>) {
        let user = await getConnection().getRepository(User).findOne({
            where: {
                id: data.id
            },
            relations: ["login"],
        });

        if(user.login.ttl === -1) {
            return { session: data.session, userId: data.id };        
        }

        let session;
        if((user.login.session === data.session) && (user.login.ttl === -1 || (new Date(user.login.sessionCreated).getTime() - new Date().getTime()) <= user.login.ttl)) {
            session = md5(Math.random().toString(36).substr(7))
            user.login.session = session;
            user.login.sessionCreated = new Date();
            user.login.ttl = 1000*60*60*24; // 1 day
            getConnection().manager.save(user.login);
        } else {
            user.login.session = null;
            user.login.ttl = null;
            user.login.sessionCreated = null;
            getConnection().manager.save(user.login);
            
        }

        return { session: session, userId: data.id };
    }

}