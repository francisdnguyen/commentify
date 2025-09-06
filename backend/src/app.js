import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

export default app;