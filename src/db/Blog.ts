import { BaseApi } from "./Utils";
import { IUser, User } from "../entity/User";
import { IApiContext } from "../api/api";
import { Perm } from "../ValidationDecorator";
import { Blog, IBlog } from "../entity/Blog";
import { Database } from "./database";
import { getConnection } from "typeorm";
import { Comment } from "../entity/Comment";

export class BlogApi extends Database implements BaseApi<IBlog> {
    
    @Perm(10)
    public async addNew(ctx: IApiContext, data: Partial<IBlog>) {
        let blog = new Blog();
        blog.blog = data.blog;
        let user = await getConnection().manager.getRepository(User).findOne({where: {id: ctx.user.id}});
        blog.author = user;
        getConnection().manager.save(Blog);
    }

    public put(ctx: IApiContext, data: Partial<IBlog>) {
        
    }

    @Perm(20)
    public async comment(ctx: IApiContext, data: {blogId: number, comment: string}) {
        let comment = new Comment();
        let blog = await getConnection().manager.getRepository(Blog).findOne({where: {id: data.blogId}});
        let author = await getConnection().manager.getRepository(User).findOne({where: {id: ctx.user.id}});

        comment.blog = blog;
        comment.comment = data.comment;
        comment.author = author;

        getConnection().manager.save(comment);
    }

    @Perm(0)
    public deleteComment(ctx: IApiContext, data: Partial<IUser>) {
        throw new Error("Method not implemented.");
    }

    @Perm(0)
    public delete(ctx: IApiContext, data: Partial<IUser>) {
        throw new Error("Method not implemented.");
    }


}