import express from "express";
import dotenv from "dotenv";
import authRoute from "./routes/auth.route.js";
import blogRoute from "./routes/blog.route.js";
import logger from "./middlewares/logger.middleware.js";
import cors from "cors";

dotenv.config();

const app = express();

const allowedOrigins = ["http://localhost:5173"];
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
app.set("view engine", "ejs");
app.set("views", "src/views");

app.use("/api/auth", authRoute);
app.use("/api/posts", blogRoute);

app.all("*", (req, res) => {
	res.status(404).json({ message: `Page ${req.url} not found` });
});

export default app;
