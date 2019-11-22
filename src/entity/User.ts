import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, ManyToOne} from "typeorm";
import { Login, ILogin } from "./Login";
import { Permission } from "./Permission";
import { Gamedata } from "./Gamedata";
import { GameInfo } from "./GameInfo";
import { Ticket } from "./Ticket";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    loginName: string;

    @Column()
    avatarId: number;

    @Column({default: false})
    active: boolean;

    @Column({ default: () => `now()` })
    createdAt: Date;

    @Column({default: false})
    isBot: boolean;

    @Column({default: false})
    isBanned: boolean;

    @OneToOne(type => Login)
    @JoinColumn()
    login: Login;

    @OneToOne(type => GameInfo)
    @JoinColumn()
    gameinfo: GameInfo;

    @ManyToOne(type => Permission, perm => perm.users)
    @JoinColumn()
    permission: Permission;

    @OneToMany(type => Gamedata, gamedata => gamedata.user, {cascade: true,})
    @JoinColumn()
    gamedata: Gamedata[];

    @OneToMany(type => Ticket, ticket => ticket.author, {cascade: true,})
    @JoinColumn()
    ticket: Ticket[];

}


export class IUser {
    id: number;
    loginName: string;
    avatarId: number;
    isBanned: boolean;
    isBot: boolean;
    login: ILogin;
    gameinfo: GameInfo;
    gamedata: Gamedata[];
    active: boolean;
    permission: Permission;
}