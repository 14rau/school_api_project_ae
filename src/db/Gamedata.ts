import { BaseApi } from "./Utils";
import { IUser, User } from "../entity/User";
import { ILogin, Login } from "../entity/Login";
import { IApiContext } from "../api/api";
import { Validate } from "../ValidationDecorator";
import { Gamedata, IGamedata } from "../entity/Gamedata";
import { Database } from "./database";
import { getConnection } from "typeorm";

export class GamedataApi extends Database implements BaseApi<IUser> {
    public async addNew(ctx: IApiContext, data: Partial<IGamedata>) {
        let gamedata = new Gamedata();
        gamedata.actions = data.actions;
        gamedata.gameStart = data.gameStart;
        gamedata.gameEnd = data.gameEnd;
        // use context, since nobody should create data from some other people
        const user = await getConnection().getRepository(User).findOne(ctx.user.id);
        gamedata.user = user;
        getConnection().manager.save(gamedata);
    }

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