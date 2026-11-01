import dotenv from "dotenv"
dotenv.config()
import express from "express"
import connectDB from "./db/connectDB.js"
import app from "./app.js"

const Port = process.env.PORT || 8000

connectDB()
.then(() => {
    app.listen(Port, () => {
        console.log(`Server is running on PORT ${Port}`);
        
    })
})
.catch((err) => {
    console.log("DB connection error, ", err);
})

