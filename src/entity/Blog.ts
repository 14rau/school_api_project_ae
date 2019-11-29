import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany} from "typeorm";
import { User } from "./User";
import { Comment } from "./Comment";

@Entity()
export class Blog {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    blog: string;

    @Column({ default: () => `now()` })
    createdAt: Date;

    @ManyToOne(type => User, user => user.blogs)
    author: User;

    @OneToMany(type => Comment, comment => comment.blog)
    comments: Comment[];




}

export interface IBlog {
    id: number;
    blog: string;
    createdAt: Date;
    author: User;
    comments: Comment[];
}
