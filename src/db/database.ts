import {createConnection, Connection} from "typeorm";


export class Database {
    protected connection: Connection;

    public init(con) {
        this.connection = con;
    }
}