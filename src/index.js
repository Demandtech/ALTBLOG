import express from "express";
import dotenv from "dotenv";
import authRoute from "./routes/auth.route.js";

dotenv.config();

const app = express();

app.use(express.json());

app.get("/", (_, res) => {
	res.send("Welcome to my Alt School Assignment Five!");
});

app.use("/auth", authRoute);

app.all("*", (req, res) => {
	res.status(404).json({ message: `Page ${req.url} not found` });
});

export default app;
