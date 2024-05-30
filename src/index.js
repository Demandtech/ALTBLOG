import express from "express";
import dotenv from "dotenv";
import authRoute from "./routes/auth.route.js";
import blogRoute from "./routes/blog.route.js";
import userRoute from "./routes/user.route.js";
import commentRoute from "./routes/comment.route.js";
import bodyParser from "body-parser";
import logger from "./middlewares/logger.middleware.js";
import cors from "cors";
import path from "path";

dotenv.config();

const app = express();
export const dir_name = path.dirname(new URL(import.meta.url).pathname);

const allowedOrigins = [
	"http://localhost:5173",
	"https://altblog-frontend.vercel.app",
];

app.use(
	cors({
		origin: function (origin, callback) {
			if (!origin || allowedOrigins.indexOf(origin) !== -1) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
	})
);

app.use(express.json());
app.use(logger);
app.use(bodyParser.json({ limit: "50mb" }));

app.use("/uploads", express.static(path.join(dir_name, "uploads")));

app.use("/api/auth", authRoute);
app.use("/api/posts", blogRoute);
app.use("/api/users", userRoute);
app.use("/api/comments", commentRoute);

app.get("/", (req, res) => {
	res.send("Welcome to Blogshot Api");
});

app.all("*", (req, res) => {
	res.status(404).json({ message: `Page ${req.url} not found` });
});

export default app;
