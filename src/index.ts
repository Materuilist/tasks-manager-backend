import * as bodyParser from "body-parser";
import * as express from "express";

import initDb from "./utils/initDb";
import sequalize from "./utils/database";

import authRouter from "./routes/auth.router";
import projectRouter from "./routes/project.router";

const app = express();

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");

    next();
});

app.use("/", bodyParser.json({ limit: "5mb" }));

app.use("/api/auth", authRouter);
app.use("/api/project", projectRouter);

app.use("/", (error, req, res, next) => {
    if (error) {
        console.log(error);
        return res.status(error.status).json({ message: error.message });
    }
});

sequalize.sync().then(() => {
    app.listen(8000, () => {
        console.log(`I'm listening!`);
        // initDb(true, true);
    });
});
