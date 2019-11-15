import { BaseApi } from "./Utils";
import { Database } from "./database";
import { IUser, User } from "../entity/User";
import { ILogin, Login } from "../entity/Login";
import { IApiContext } from "../api/api";
import { Perm } from "../ValidationDecorator";
import { getConnection } from "typeorm";
import { Permission } from "../entity/Permission";
import { Rank } from "../entity/Rank";
import { GameInfo } from "../entity/GameInfo";
import { socketServer } from "..";
// import { streamMessage } from "../api/socket";
const bcrypt = require('bcrypt');

export class UserApi extends Database implements BaseApi<IUser> {

    public addNew(ctx: IApiContext, data: Partial<IUser>) {
        throw new Error("Method not implemented.");
    }

    @Perm(10)
    public async chat(ctx: IApiContext, data: {message: string}) {
        socketServer.streamMessage(data.message, ctx.user.loginName, ctx.user.permission.id);
        return;
    }

    @Perm(0)
    public async unlock(ctx: IApiContext, data: Partial<IUser> & {id: number}) {
        let user = await getConnection().manager.getRepository(User).findOne({id: data.id});
        user.active = true;
        getConnection().manager.save(user);
    }

    @Perm(20)
    public async getHighscoreList(ctx) {
        return await getConnection().manager.getRepository(User)
            .createQueryBuilder("user")
            .select()
            .leftJoinAndSelect("user.gameinfo", "gameinfo")
            .addOrderBy("gameinfo.highscore", "DESC")
            .limit(20)
            .execute();
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
        // remove this
        let gameinfo = new GameInfo();
        gameinfo.highscore = Math.floor(Math.random() * 1001);
        gameinfo.points = Math.floor(Math.random() * 100001); 
        user.gameinfo = gameinfo;
        // user.highscore = Math.floor(Math.random() * 1001); 
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

        queryResult = await getConnection().createQueryBuilder()
            .insert()
            .into(GameInfo)
            .values({
                ...gameinfo
            })
            .execute();
        let gameinfoid = queryResult.identifiers[0].id;

        user.permission = permission;
        let i = await getConnection().createQueryBuilder()
            .insert()
            .into(User)
            .values({
                ...user,
                login: loginId,
                gameinfo: gameinfoid,
            })
            .execute();

        
        // let userId = i.identifiers[0].id; // get userId

        return true;
        
    }

    @Perm(20)
    public async setAvatar(ctx: IApiContext, data:{avatarId: number}) {
        let repo = getConnection().manager.getRepository(User);
        let user = await repo.findOne({id: ctx.user.id}, {relations: ["permission", "gameinfo"]});
        user.avatarId = data.avatarId;
        return repo.save(user);
    }

    @Perm(20)
    public async getById(ctx: IApiContext, data: {userId: number}) {
        let res = await getConnection().manager.getRepository(User).findOne({where: {id: data.userId}, relations: ["permission", "gameinfo"]});
        let rank = await getConnection()
                        .createQueryBuilder()
                        .select("rank")
                        .from(Rank, "rank")
                        .where("rank.points <= :points", {points: res.gameinfo.points})
                        .addOrderBy("rank.points", "DESC")
                        .execute();
        let currentRank = rank[0];
        let nextRank = await getConnection()
                        .createQueryBuilder()
                        .select("rank")
                        .from(Rank, "rank")
                        .where("rank.points >= :points", {points: currentRank.rank_points})
                        .addOrderBy("rank.points", "DESC")
                        .getOne()

        return {...res, currentRank, nextRank}
    }

    @Perm(20)
    public async get(ctx: IApiContext, data: {pagesize: number, page: number}) {
        let res = await getConnection().manager.getRepository(User).find({relations: ["permission"], take: data.pagesize, skip: data.pagesize * data.page});
        return res;
    }


    // id is userid and session is session string
    public async validate(ctx: IApiContext, data: {id: number, session: string}) {
        let [ id, session ] = [ ctx.user.id, ctx.session ];
        let user = await getConnection().manager.getRepository(User).findOne({where: {id: id}, relations: ["login", "permission"]});
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
