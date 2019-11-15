import { BaseApi } from "./Utils";
import { IUser, User } from "../entity/User";
import { IApiContext } from "../api/api";
import { Perm } from "../ValidationDecorator";
import { Rank, IRank } from "../entity/Rank";
import { Database } from "./database";
import { getConnection } from "typeorm";

export class RankApi extends Database implements BaseApi<IUser> {
    
    @Perm(0)
    public async addNew(ctx: IApiContext, data: Partial<IRank>) {
        let rank = new Rank();
        rank.color = data.color;
        rank.name = data.name;
        rank.points = data.points;
        getConnection().manager.save(Rank);
    }

    @Perm(200)
    public test(data) {
        return {test: "Test successfull"};
    }

    public put(ctx: IApiContext, data: Partial<IUser>) {
        
    }

    public getDataFromOneUser(ctx, data: {id: number}) {
        
    }

    public delete(ctx: IApiContext, data: Partial<IUser>) {
        throw new Error("Method not implemented.");
    }


}