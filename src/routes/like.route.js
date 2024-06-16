import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
	handleLikePost,
	handleLikeComment,
	handleLikePostUsers,
} from "../controllers/like.controller.js";

const likeRoute = Router();
likeRoute.use(authMiddleware);
likeRoute.get("/posts/:postId", handleLikePost);
likeRoute.get("/comments/:commentId", handleLikeComment);
likeRoute.get("/users/:postId", handleLikePostUsers);
export default likeRoute;
