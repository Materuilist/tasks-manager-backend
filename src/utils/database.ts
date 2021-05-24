import { Sequelize } from "sequelize";

const sequalize = new Sequelize("tasks_manager", "root", "ищкщц123", {
    dialect: "mysql",
    host: "localhost",
});

export default sequalize;
