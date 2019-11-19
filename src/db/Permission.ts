/*
    public async getPermission(ctx, userId) {
        let user = this.connection.manager.getRepository(User).findByIds([userId], {
            relations: ["permission"]
        })
    }
*/


import { BaseApi } from "./Utils";
import { Database } from "./database";
import { IUser, User } from "../entity/User";
import { ILogin, Login } from "../entity/Login";
import { IApiContext } from "../api/api";
import { Permission } from "../entity/Permission";
import { Perm } from "../ValidationDecorator";

export class PermissionApi extends Database implements BaseApi<IUser> {

    public addNew(ctx: IApiContext, data: Partial<IUser>) {
        throw new Error("Method not implemented.");
    }

    @Perm(20)
    public async get(ctx: IApiContext) {
        return this.connection.manager.getRepository(Permission).find();
    }

    public async getPermission(ctx, id) {
        const user = await this.connection.manager.getRepository(User).findByIds([id], {
            relations: ["permission"]
        });
        return user[0].permission.id;
    }

    public put(ctx: IApiContext, data: Partial<IUser>) {
        
    }

    public delete(ctx: IApiContext, data: Partial<IUser>) {
        throw new Error("Method not implemented.");
    }


}