import { Server } from "socket.io";
import notificationModel from "./databases/models/notification.model.js";

let onlineUsers = new Set();

const socketServer = async (server) => {
	const io = new Server(server, {
		cors: { origin: process.env.CLIENT_URL },
	});

	io.on("connection", (socket) => {
		socket.on("addNewUser", (userId) => {
			onlineUsers.add({ userId, socketId: socket.id });
			console.log(onlineUsers);
		});

		socket.on("like", async (payload) => {
			console.log(payload);
			const notification = new notificationModel(payload);
			
			await notification.save();
		});

		socket.on("disconnect", () => {
			onlineUsers = new Set(
				[...onlineUsers].filter((user) => user.socketId != socket.id)
			);
		});
	});

	console.log(onlineUsers);
};

export default socketServer;
