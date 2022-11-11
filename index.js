import cors from "cors";
import express, { json } from "express";
import mongodb from "mongodb";

const app = express();

app.use(cors());
app.use(json());


app.listen(5000, () => console.log("Server running in port 5000..."))