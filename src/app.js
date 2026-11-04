import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))


// accepting data (in limit) through json format 
// JSON body-parsing middleware.
// Reads JSON data sent by the client and makes it available in req.body
// backend can receive data such as a user's name, email, or password from a frontend.
app.use(express.json({limit: "16kb"}))


// accepting data through url
// Parses form data sent in application/x-www-form-urlencoded format and makes it available in req.body
// handle traditional HTML form submissions.
app.use(express.urlencoded({extended: true, limit:"16kb"}))


// Serves files from your public directory.
// browsers access files such as images, CSS, JavaScript, or other public assets without creating a separate route for each file.
app.use(express.static("public"))



// to access data through cookies
// let your backend read cookie values, often used for sessions or authentication-related workflows.
app.use(cookieParser())


// import routes
import userRouter from "./routes/user.routes.js"


// routes decalration
app.use("/api/v1/user", userRouter)

export default app