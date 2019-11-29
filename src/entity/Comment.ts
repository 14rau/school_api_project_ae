import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne} from "typeorm";
import { User } from "./User";
import { Blog } from "./Blog";

@Entity()
export class Comment {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    comment: string;

    @Column({ default: () => `now()` })
    createdAt: Date;

    @OneToOne(type => User, user => user.comments)
    author: User;

    @ManyToOne(type => Blog, blog => blog.comments)
    blog: Blog;


}

export interface IComment {
    id: number;
    blog: Blog;
    comment: string;
    createdAt: Date;
    author: User;
}
