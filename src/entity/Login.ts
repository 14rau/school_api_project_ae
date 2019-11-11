import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn} from "typeorm";
import { User } from "./User";

@Entity()
export class Login {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    hash: string;

    @Column({ nullable: true })
    session?: string;

    @Column({ nullable: true })
    sessionCreated?: Date;

    // time to live
    @Column({ nullable: true })
    ttl?: number;

}

export interface ILogin {
    id: number;
    hash: string;
    session?: string;
    sessionCreated?: Date;
    ttl?: number;
}
