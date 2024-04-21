import express from "express";
import dotenv from "dotenv";
import authRoute from "./routes/auth.route.js";
import blogRoute from "./routes/blog.route.js";
import logger from "./middlewares/logger.middleware.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(logger);

app.get("/", (_, res) => {
	res.send("Welcome to my Alt School Assignment Five!");
});

app.use("/api/auth", authRoute);
app.use("/api/posts", blogRoute);

app.all("*", (req, res) => {
	res.status(404).json({ message: `Page ${req.url} not found` });
});

export default app;
