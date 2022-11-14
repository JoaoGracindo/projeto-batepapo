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
    text: Joi.string().min(1).required(),
    type: Joi.string().valid('private_message', 'message', "status").required()

})



app.use(cors());
app.use(json());
dotenv.config();
const mongoClient = new MongoClient("mongodb://localhost:27017");


await mongoClient.connect();
const db = mongoClient.db("uol")
const participants = db.collection("participants")
const messages = db.collection("messages")




app.post("/participants", async (req, res) => {

    const validation = participantSchema.validate(req.body);
    const {name} = req.body;
   
    if(validation.error){
        res.status(422).send(validation.error.message);
        return
    }


    try {
        const userExist = await participants.findOne({name});
        if(userExist){
            res.sendStatus(409);
            return
        }
        await participants.insertOne({name, lastStatus: Date.now()});
        res.status(201)
    
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
        return
    }
})


app.get("/participants", ( async (req, res) => {

    try {
        const participant = await participants.find().toArray();
        res.status(200).send(participant)
    
    } catch (err) {
        console.log(err)
    }
}))



app.post("/messages", (async (req, res) => {

    const {to, text, type} = req.body;
    const {user} = req.headers;

    const validation = messageSchema.validate(req.body, {abortEarly: false});
    if(validation.error){
        console.log(validation.error)
        res.sendStatus(422);
        return
    }

    try {
        await messages.insertOne({from: user, to, text, type, time: now.format("HH:MM:SS")});
        res.status(201)
        return
    
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
        return
    }

}))



app.get("/messages", (async (req, res) => {

    const {user} = req.headers;
    const {limit} = req.query;

    try {
        let response = await messages
                                      .find()
                                      .sort({time: -1})
                                      .toArray();
        if(limit){
            response = response.slice(0, limit-1)
        }
        res.status(200).send(response)
        return
    
    } catch (err) {
        console.log(err)
        res.sendStatus(500);
        return
    }
}))



app.post("/status", (async (req, res) => {
    const {user} = req.headers;

    try {
        const participant = await participants.findOne({name: user});
        if(!participant){
            res.status(404);
            return
        }
        await participant.updateOne({
            name: user},
            {$set:{lastStatus: Date.now()}
        })
        res.status(200)
    
    } catch (err) {
        console.log(err)
    }
}))


async function invalidUsersRemoval(){
    try{
        const allParticipants = await participants.find().toArray();
        const expiredParticipants = allParticipants.filter((object) => Date.now() > object.lastStatus + 15000)
        for(let i = 0;i < expiredParticipants.length; i++){
            await participants.deleteOne({name: expiredParticipants[i].name});
            await messages.insertOne({from: expiredParticipants[i].name,
                                      to: 'Todos',
                                      text: 'sai da sala...',
                                      type: 'status',
                                      time: now.format("HH:MM:SS")})
            
        }

    } catch(err){
        console.log(err);
    }

 }


 setInterval(invalidUsersRemoval,15000)


app.listen(5000, () => console.log("Server running in port 5000..."))