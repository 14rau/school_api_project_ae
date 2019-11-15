import { BaseApi } from "./Utils";
import { IUser, User } from "../entity/User";
import { IApiContext } from "../api/api";
import { Perm } from "../ValidationDecorator";
import { Gamedata, IGamedata } from "../entity/Gamedata";
import { Database } from "./database";
import { getConnection } from "typeorm";

export class GamedataApi extends Database implements BaseApi<IUser> {

    @Perm(10)
    public async adminFunction(ctx: IApiContext, data) {
        return {test: "Run Admin function"}
    }

    @Perm(0)
    public async rootFunction(ctx: IApiContext, data) {
        return {test: "Run root function"}
    }

    public async addNew(ctx: IApiContext, data: Partial<IGamedata>) {
        let gamedata = new Gamedata();
        let { actions, gameStart, gameEnd, points, mouseMoved } = data;
        gamedata.actions = actions;
        gamedata.gameStart = gameStart;
        gamedata.gameEnd = gameEnd;
        gamedata.points = points;
        gamedata.mouseMoved = mouseMoved;
        // use context, since nobody should create data from some other people
        const user = await getConnection().getRepository(User).findOne({where: {id: ctx.user.id}, relations: ["gameinfo"]});
        if(points > user.gameinfo.highscore) user.gameinfo.highscore = points; // update highscore since we have now a better score
        user.gameinfo.points += gamedata.points;
        user.gameinfo.timeSpend = new Date(gameEnd).getTime() - new Date(gameStart).getTime() 
        gamedata.user = user;
        getConnection().manager.save([gamedata, user.gameinfo]);
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