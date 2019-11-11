import {Entity, Column, OneToOne, JoinColumn, PrimaryColumn, OneToMany} from "typeorm";
import { Login, ILogin } from "./Login";
import { User } from "./User";

@Entity()
export class Permission {

    @PrimaryColumn()
    id: number;

    @Column()
    permissionName: string;

    @OneToMany(type => User, user => user.permission, {cascade: true},)
    users: User[];
}


export class IPermission {
    id: number;
    permissionName: string;
    users: User[];
}