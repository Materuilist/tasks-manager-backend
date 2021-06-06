import * as bodyParser from "body-parser";
import * as express from "express";
import * as path from "path";

import initDb from "./utils/initDb";
import sequalize from "./utils/database";

import authRouter from "./routes/auth.router";
import projectRouter from "./routes/project.router";
import taskRouter from "./routes/task.router";
import testAppRouter from "./routes/test-app.router";

const app = express();

app.set("view engine", "pug");
app.set("views", "src/views");

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");

    next();
});

app.use("/", bodyParser.json({ limit: "5mb" }));
app.use(express.static(path.join(__dirname, "static")));

app.use("/api/auth", authRouter);
app.use("/api/project", projectRouter);
app.use("/api/task", taskRouter);
app.use("/test-app", testAppRouter);

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
