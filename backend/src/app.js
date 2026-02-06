import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

connectDB();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);

app.use(errorHandler);

export default app;
