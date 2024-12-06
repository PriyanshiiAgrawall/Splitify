import dotenv from 'dotenv';
dotenv.config();
import logger from "./utils/logger.js";
import morgan from "morgan";
import express from "express";

import { dbConnect } from "./db/db.js";

const app = express();

app.use(express.json());


const morganFormat = ":method :url :status :response-time ms";

app.use(
    morgan(morganFormat, {
        stream: {
            write: (message) => {
                const logObject = {
                    method: message.split(" ")[0],
                    url: message.split(" ")[1],
                    status: message.split(" ")[2],
                    responseTime: message.split(" ")[3],
                };
                logger.info(JSON.stringify(logObject));
            },
        },
    })
);

const Port = process.env.PORT;
//app.listen() is asynchronous 
const server = () => {
    dbConnect();

    app.listen(Port, () => {
        console.log("Listening to port", Port);
    });

}
server();

app.get('/', (req, res) => {
    res.send("hello world");
})