import {Entity, Column, OneToOne, JoinColumn, PrimaryColumn, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import { Login, ILogin } from "./Login";
import { User } from "./User";

@Entity()
export class GameInfo {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({default: 0})
    highscore: number;

    @Column({default: 0})
    points: number;

    @Column({default: 0})
    timeSpend: number;


}


export class IGameInfo {
    id: number;
    highscore: number;
    points: number;
    timeSpend: number;
}