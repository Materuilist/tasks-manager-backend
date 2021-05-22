import * as express from "express";

const app = express();

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");

    next();
});

app.get("/", (request, response) => {
    response.send("Hello world!");
});

app.listen(8000, () => console.log(`I'm listening!`));
