import { BaseApi } from "./Utils";
import { IUser, User } from "../entity/User";
import { IApiContext } from "../api/api";
import { Perm } from "../ValidationDecorator";
import { Gamedata, IGamedata } from "../entity/Gamedata";
import { Database } from "./database";
import { getConnection } from "typeorm";
import { socketServer } from "..";

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
        let { bulletsShot, enemiesKilled, finalScore, timeWastedInThisGame, wave } = data;
        gamedata.bulletsShot = bulletsShot;
        gamedata.enemiesKilled = enemiesKilled;
        gamedata.finalScore = finalScore;
        gamedata.timeWastedInThisGame = timeWastedInThisGame;
        gamedata.wave = wave;
        // use context, since nobody should create data from some other people
        const user = await getConnection().getRepository(User).findOne({where: {id: ctx.user.id}, relations: ["gameinfo"]});
        if(finalScore > user.gameinfo.highscore) user.gameinfo.highscore = finalScore; // update highscore since we have now a better score
        if((user.gameinfo.points += gamedata.finalScore) < 0) {
            user.gameinfo.points = 0;
        } else {
            user.gameinfo.points += gamedata.finalScore;
        }// in case the added final score will be bellow 0, fix it.
        user.gameinfo.timeSpend += timeWastedInThisGame;
        user.gameinfo.shots += bulletsShot;
        gamedata.user = user;
        socketServer.streamMessage(`${user.loginName} just finished an game! Score was at ${gamedata.finalScore} and he shot ${gamedata.bulletsShot} GURKEN!`);
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