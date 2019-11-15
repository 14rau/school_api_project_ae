import "reflect-metadata";
import { BurgerKrigApi } from "./api/api";
import { createConnection, getConnection } from "typeorm";
import { Application } from "./api/main";
import { Rank } from "./entity/Rank";

(async () => {
    const connection = await createConnection();

    if(require("../apiconfig").debug) {
        let repo = getConnection().manager.getRepository(Rank);
        let one = new Rank();
        one.name = "Salatblatt Fresser"
        one.color = "green";
        one.points = 0;
        let two = new Rank();
        two.name = "Senfglas Gucker"
        two.color = "green";
        two.points = 100;
        let three = new Rank();
        three.name = "Ketchupflecken Untertan"
        three.color = "green";
        three.points = 200;
        let four = new Rank();
        four.name = "Sesamkrümel Monster"
        four.color = "red";
        four.points = 500;
        let five = new Rank();
        five.name = "Gewürzgurken Jedi"
        five.color = "red";
        five.points = 1000;
        let six = new Rank();
        six.name = "Tomatenscheiben Ninja"
        six.color = "red";
        six.points = 10000;
        let seven = new Rank();
        seven.name = "Gurkenscheiben Master"
        seven.color = "yellow";
        seven.points = 50000;
        let eight = new Rank();
        eight.name = "Burger King"
        eight.color = "steelblue";
        eight.points = 100000;

       repo.save([two,
        three,
        four,
        five,
        six,
        seven,
        eight])
    }
    
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

