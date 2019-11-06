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

export class PermissionApi extends Database implements BaseApi<IUser> {

    public addNew(ctx: IApiContext, data: Partial<IUser>) {
        throw new Error("Method not implemented.");
    }

    public async get(ctx: IApiContext, userId: number) {
        const res = await this.connection.manager.getRepository(Permission).findByIds([userId]);
        return res[0];
    }

    public async getPermission(ctx, userId) {
        const user = await this.connection.manager.getRepository(User).findByIds([userId], {
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