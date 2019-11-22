import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm";
import { User } from "./User";

@Entity()
export class Ticket {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: () => `now()` })
    createdAt: Date;

    @Column()
    message: string;

    @ManyToOne(type => User, user => user.ticket)
    author: User;


}

export interface ITicket {
    id: number;
    author: User;
    message: string;
    createdAt: Date;
}
