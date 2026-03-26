import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from 'cors';

dotenv.config(); 

const app = express();

// 1. IMPROVED CORS: Removed trailing slash and added explicit options success status
const allowedOrigins = [
    "https://datathon-pied.vercel.app",
    "https://student-portal-final-sable.vercel.app" // Cleaned: No trailing slash
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl) 
        // or if the origin is in our allowed list
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    optionsSuccessStatus: 200 // Essential for some browsers to see the "200 OK" correctly
}));

// 2. MIDDLEWARE STACK
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Helmet configuration: Ensuring it doesn't block cross-origin resources
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));

app.set("trust proxy", 1);

// 3. SESSION CONFIG
app.use(
    session({
        secret: process.env.SECRET_KEY || "fallback-secret-key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: true, // MUST be true for SameSite: "none" to work on Render/Vercel
            httpOnly: true,
            sameSite: "none", // Required for cross-domain cookies
            maxAge: 5 * 60 * 60 * 1000 * 100, 
        },
    })
);

app.use(express.static("public"));

// Logging for debugging
app.use((req, res, next) => {
    console.log(`Incoming ${req.method} from ${req.headers.origin}`);
    next();
});

// 4. ROUTES
import userRouter from "./routes/userRoutes.js";
import adminRouter from "./routes/route.js";

app.use("/api/v1/student", userRouter);
app.use("/api/v1/admin", adminRouter);

export { app };