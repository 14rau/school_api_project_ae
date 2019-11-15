import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, ManyToOne} from "typeorm";
import { Login, ILogin } from "./Login";
import { Permission } from "./Permission";
import { Gamedata } from "./Gamedata";
import { GameInfo } from "./GameInfo";

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

}


export class IUser {
    id: number;
    loginName: string;
    avatarId: number;
    login: ILogin;
    gameinfo: GameInfo;
    gamedata: Gamedata[];
    active: boolean;
}