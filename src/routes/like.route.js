import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
	handleLikePost,
	handleLikeComment,
	handleLikePostUsers,
	handleLikeReply,
	handleLikeCommentUsers
} from "../controllers/like.controller.js";

const likeRoute = Router();
likeRoute.get("/users/:postId", handleLikePostUsers);
likeRoute.get("/comments/users/:commentId", handleLikeCommentUsers);

likeRoute.use(authMiddleware);

likeRoute.get("/posts/:postId", handleLikePost);
likeRoute.get("/comments/:commentId", handleLikeComment);
likeRoute.get("/reply/:replyId", handleLikeReply);
export default likeRoute;
