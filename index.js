import cors from "cors";
import express, { json } from "express";
import {MongoClient} from "mongodb";
import Joi from "joi";
import dayjs from "dayjs";
import dotenv from "dotenv";

const app = express();

const now = dayjs()


const participantSchema = Joi.object({
    name: Joi.string().min(1).required()
})
const messageSchema = Joi.object({
    to: Joi.string().min(1).required(),
    text: Joi.string().min(1).required()
})



app.use(cors());
app.use(json());
dotenv.config();
const mongoClient = new MongoClient(process.env.MONGO_URI);

let db;
let participants;
let messages;

mongoClient.connect().then(() => {
    db = mongoClient.db("uol")
    participants = db.collection("participants")
    messages = db.collection("messages")
})

app.post("/participants", (req, res) => {
    const {name} = req.body

    participants.insertOne({name, lastStatus: Date.now()}).then(() => {
        res.status(201)
    })
})


app.get("/participants", ( (req, res) => {
    participants.find().toArray().then((participants) => {
        res.send(participants)
    })
    .catch((err) => {
        console.log(err)
    })
}))



app.post("/messages", ((req, res) => {

    const {to, text, type} = req.body;

    const user = req.headers.user;

    messages.insertOne({from: user, to, text, type, time: now.format("HH:MM:SS")}).then(() => {
        res.status(201)
    })
}))



app.get("/messages", ((req, res) => {

    const user = req.headers.user;

    messages.find({to: user}).toArray().then((messages) => {
        res.send(messages)
    })
    .catch((err) => {
        console.log(err)
    })
}))



app.post("/status", ((req, res) => {
    const user = req.headers.user;

    participants.findOne({name: user}).then((object) => {
        if(!object){
            res.status(404);
            return
        }
        object.lastStatus = Date.now();
        res.status(200)
    }).catch((err) => {
        console.log(err)
    })
}))



setInterval(15000, () => {

})


app.listen(5000, () => console.log("Server running in port 5000..."))