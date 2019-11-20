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
import { Gamedata } from "../entity/Gamedata";
// import { streamMessage } from "../api/socket";
const bcrypt = require('bcrypt');

export class UserApi extends Database implements BaseApi<IUser> {

    public addNew(ctx: IApiContext, data: Partial<IUser>) {
        throw new Error("Method not implemented.");
    }

    @Perm(20)
    public async chat(ctx: IApiContext, data: {message: string}) {
        try {
            if(data.message.startsWith("/")) {
                let args = data.message.split(" ");
                if(args[0] === "/ban") {
                    this.setActive(ctx, {id: Number.parseInt(args[1]), active: false})
                }
                if(args[0] === "/unban") {
                    this.setActive(ctx, {id: Number.parseInt(args[1]), active: true})
                }
            } else {
                socketServer.streamMessage(data.message, {username: ctx.user.loginName, perm: ctx.user.permission.id});
            }
        } catch (err) {
            console.log(err);
            socketServer.streamMessage("Sorry, an error occured", {to: ctx.user.id})
        }
        return;
    }

    @Perm(0)
    public async deleteData(ctx, data: {id: number}) {
        const randString = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const [username, password] = [randString(), randString()];
        await this.register({loginName: username, hash: password});

        let user = await getConnection().manager.getRepository(User).findOne({where: {loginName: username}});

        await getConnection().manager.createQueryBuilder()
            .update(Gamedata)
            .set({user})
            .where("gamedata.userId = :id", {id: data.id})
            .execute();

        await getConnection().manager.createQueryBuilder()
        

        


    }

    @Perm(0)
    public async setActive(ctx: IApiContext, data: {id: number, active: boolean}) {
        await getConnection().manager.getRepository(User).update({id: data.id}, {active: data.active});
        let user = await this.getById(ctx, {userId: data.id});
        if(!data.active) {
            socketServer.streamMessage(`${user.loginName} was banned!`);
        } else {
            socketServer.streamMessage(`${user.loginName} not longer banned!`);
        }
        return;
    }

    @Perm(0)
    public async setPermission(ctx: IApiContext, data: {id: number, permission: number}) {
        let user = await this.getById(ctx, {userId: data.id});
        user.permission = await getConnection().manager.getRepository(Permission).findOne({id: data.permission});
        await getConnection().manager.save(user);
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
            .where("user.active = :status", {status: true})
            .leftJoinAndSelect("user.gameinfo", "gameinfo")
            .addOrderBy("gameinfo.highscore", "DESC")
            .take(20)
            .execute();
    }

    @Perm(20)
    public async getPointrank(ctx) {
        return await getConnection().manager.getRepository(User)
            .createQueryBuilder("user")
            .where("user.active = :status", {status: true})
            .leftJoinAndSelect("user.gameinfo", "gameinfo")
            .addOrderBy("gameinfo.points", "DESC")
            .take(20)
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
        user.gameinfo = gameinfo;
        // user.highscore = Math.floor(Math.random() * 1001); 
        user.active = true;
        let permission = await getConnection().manager.getRepository(Permission).findOne({where: {id: 20}})
        if(!permission) { // if this permission does not exist, create it
            permission = new Permission();
            permission.id = 20;
            permission.permissionName = "user";

            let root = new Permission();
            root.id = 0;
            root.permissionName = "root";

            let mod = new Permission();
            mod.id = 10;
            mod.permissionName = "moderator";

            await getConnection().manager.save([permission, root, mod]);
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
    public search(ctx: IApiContext, data: {query: string}) {
        return getConnection()
            .manager
            .getRepository(User)
            .createQueryBuilder("user")
            .where("user.loginName like :name", {name: `%${data.query}%`})
            .getMany();
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
                        .where("rank.points > :points", {points: currentRank ? currentRank.rank_points : 0}) // take lowest rank..? might run in a problem, when has minus points for the frontend
                        // -> Should not be a problem, since we dont want the user gain too mmany minus points
                        .addOrderBy("rank.points", "ASC")
                        .getOne();

        return {...res, currentRank, nextRank}
    }

    @Perm(20)
    public async get(ctx: IApiContext, data: {pagesize: number, page: number}) {
        let res = await getConnection().manager.getRepository(User).find({relations: ["permission"], take: data.pagesize, skip: data.pagesize * data.page});
        return res;
    }


    // id is userid and session is session string
    public async validate(ctx: IApiContext, data: {id: number, session: string}) {
        console.log(ctx, "CTX_CALIDATA")
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
