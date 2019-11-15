import * as io from "socket.io";


export class SocketServer {
    clients = new Map(); // clients where we will stream the events to
    server: io.Server;
    constructor() {
        this.server = io.listen(require("../../apiconfig").eventStreamPort);
        
        this.server.on("connection", (socket) => {
            this.clients.set(socket.id, socket);
            console.info("New connection", socket.id);
            socket.on("disconnect", () => {
                this.clients.delete(socket.id);
            })
        });

    }
    
    
    public streamMessage(message: string, username?: string, perm?: number) {
        this.clients.forEach(e => {
            console.log("emit to", e.id, message);
            e.emit("data", {message: `[${new Date().toISOString()}]${username ? username : "SERVER"}: ${message}`, perm: username ? perm : 0 });
        })
    }

}
