import {Entity, Column, PrimaryGeneratedColumn} from "typeorm";
@Entity()
export class Rank {

    @PrimaryGeneratedColumn()
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