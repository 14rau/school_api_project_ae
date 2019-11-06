import "reflect-metadata";
import { BurgerKrigApi } from "./api/api";
import { createConnection } from "typeorm";
import { Application } from "./api/main";

(async () => {
    const connection = await createConnection();
    
    const burgerkrigApi = new BurgerKrigApi();
    
    await burgerkrigApi.init();
    const app = new Application({
        port: require("../apiconfig").port,
        routes: {
            cors: {
                origin: ["*"],
            },
        },},
        burgerkrigApi);
        app.start();
})();

// sideeffects

