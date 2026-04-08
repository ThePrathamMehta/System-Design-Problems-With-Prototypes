import express, { type Request, type Response } from "express"

const app = express();

app.get("/",(req : Request , res : Response) => {
    res.send("Hello from backend server 1");
})

app.listen(process.env.BE1_PORT,() => {
    console.log("server running");
})