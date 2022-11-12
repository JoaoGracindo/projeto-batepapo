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

try {
    await mongoClient.connect();
    db = mongoClient.db("uol")
    participants = db.collection("participants")
    messages = db.collection("messages")

} catch (err) {
    console.log(err)
}


app.post("/participants", async (req, res) => {
    const {name} = req.body;


    try {
        await participants.insertOne({name, lastStatus: Date.now()});
        res.status(201)
    
    } catch (err) {
        console.log(err)
    }
})


app.get("/participants", ( async (req, res) => {

    try {
        const participants = await participants.find().toArray();
        res.status(201).send(participants)
    
    } catch (err) {
        console.log(err)
    }
}))



app.post("/messages", (async (req, res) => {

    const {to, text, type} = req.body;

    const user = req.headers.user;


    try {
        await messages.insertOne({from: user, to, text, type, time: now.format("HH:MM:SS")});
        res.status(201)
    
    } catch (err) {
        console.log(err)
    }

}))



app.get("/messages", (async (req, res) => {

    const user = req.headers.user;

    try {
        const messages = await messages.find({to: user}).toArray();
        res.status(201).send(messages)
    
    } catch (err) {
        console.log(err)
    }
}))



app.post("/status", (async (req, res) => {
    const user = req.headers.user;

    try {
        const participant = await participants.findOne({name: user});
        if(!participant){
            res.status(404);
            return
        }
        object.lastStatus = Date.now();
        res.status(200)
    
    } catch (err) {
        console.log(err)
    }
}))



setInterval(15000, () => {

})


app.listen(5000, () => console.log("Server running in port 5000..."))