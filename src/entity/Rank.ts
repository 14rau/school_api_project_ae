import {Entity, Column, OneToOne, JoinColumn, PrimaryColumn, OneToMany} from "typeorm";
import { Login, ILogin } from "./Login";
import { User } from "./User";

@Entity()
export class Rank {

    @PrimaryColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    color: string;

    @Column()
    points: number;
}


export class IRank {
    id: number;
    name: string;
    color: string;
    points: number;
}