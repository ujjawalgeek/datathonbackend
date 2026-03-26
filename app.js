import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import helmet from "helmet"
import cors from 'cors'
dotenv.config(); 

const app = express();

const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.RENDER === "true" ||
    process.env.VERCEL === "1";
const allowedOrigins = [
    "https://student-portal-final-sable.vercel.app",
    "https://datathon-pied.vercel.app",
    "http://localhost:5173",
    "http://localhost:5177",
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("CORS origin not allowed"));
    },
    credentials:true
}))

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
// app.use(slow);
// app.use(limiter);
app.use(helmet());
app.set("trust proxy", 1);


app.use(
    session({
        secret: process.env.SECRET_KEY || "fallback-secret-key",
        resave: false,
        saveUninitialized: false,
        proxy: true,
        cookie: {
            secure: isProduction,
            httpOnly: true,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 5 * 60 * 60 * 1000,
        },
    })
);

app.use(express.static("public"));

app.use((req, res, next) => {
    console.log("Session Data:", req.session);
    next();
});

import userRouter from "./routes/userRoutes.js";
import adminRouter from "./routes/route.js"

app.use("/api/v1/student", userRouter);
app.use("/api/v1/admin", adminRouter);

export { app };