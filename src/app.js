import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import {errorHandler} from "./middleware/error.middleware.js"
import { generalLimiter } from "./middleware/rate-limit.middleware.js";


import {pageRoutes} from "./routes/page.routes.js"
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js"
import adminRoutes from "./routes/admin.routes.js";
import postRoutes from "./routes/post.routes.js";
import commentRoutes from "./routes/comment.routes.js";


const app = express();

app.set("trust proxy", 1);

app.use(helmet());


if (!process.env.APP_URL) {
  throw new Error("APP_URL environment variable is required for CORS configuration");
}
app.use(
  cors({
    origin: process.env.APP_URL,
    credentials: true
  })
);

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api", generalLimiter);

app.use(express.static("public"))
app.use("/", pageRoutes);

app.use("/api/auth", authRoutes); 
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);

app.get("/api/health", (req, res) => {
    res.json({
      status: "ok"
    });
  });
  
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

app.use(errorHandler)

export default app;