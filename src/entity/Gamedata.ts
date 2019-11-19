import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm";
import { User } from "./User";

@Entity()
export class Gamedata {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    timeWastedInThisGame: number;

    @Column()
    finalScore: number;

    @Column()
    bulletsShot: number;

    @Column()
    enemiesKilled: number;

    @Column()
    wave: number;

    @Column({ default: () => `now()` })
    createdAt: Date;

    @ManyToOne(type => User, user => user.gamedata)
    user: User;


}

export interface IGamedata {
    id: number;
    timeWastedInThisGame: number;
    finalScore: number;
    bulletsShot: number;
    enemiesKilled: number;
    wave: number;
    createdAt: Date;
    user: User;
}
