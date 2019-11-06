import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm";
import { User } from "./User";

@Entity()
export class Gamedata {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    actions: string;

    @Column()
    gameEnd: string;

    @Column()
    gameStart: string;

    @ManyToOne(type => User, user => user.gamedata)
    user: User;

}

export interface IGamedata {
    id: number;
    actions: string;
    gameStart: string;
    gameEnd: string;
    user: User;
}
