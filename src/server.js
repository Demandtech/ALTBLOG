import mongoose from "mongoose";
import app from "./index.js";
import redis from "redis";
import { Server } from "socket.io";
import { createServer } from "http";

const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT || 5500;
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || "";

// export const redisClient = redis.createClient({
// 	// host: REDIS_HOST,
// 	// port: REDIS_PORT,
// 	url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
// });

// import { createClient } from 'redis'

export const redisClient = redis.createClient({
	password: REDIS_PASSWORD,
	socket: {
		host: REDIS_HOST,
		port: REDIS_PORT,
	},
});

let onlineUsers = new Set();

const startServer = async () => {
	try {
		await mongoose.connect(MONGO_URL);
		console.log("DB connected");

		redisClient.on("error", (err) => {
			console.log("Catching DB error: ", err);
		});

		redisClient.on("connect", () => {
			console.log("Catching DB connected");
		});

		await redisClient.connect();

		const server = createServer(app);

		const io = new Server(server, {
			cors: { origin: process.env.CLIENT_URL },
		});

		io.on("connection", (socket) => {
			socket.on("addNewUser", (userId) => {
				onlineUsers.add({ userId, socketId: socket.id });
				console.log(onlineUsers)
			});

			socket.on("disconnect", () => {
				onlineUsers = new Set(
					[...onlineUsers].filter((user) => user.socketId != socket.id)
				);
			});
		});

		console.log(onlineUsers);

		server.listen(PORT, () => {
			console.log(`Server is running on PORT: ${PORT}`);
		});
	} catch (error) {
		console.log("Error starting server: ", error.message);
	}
};



startServer();
