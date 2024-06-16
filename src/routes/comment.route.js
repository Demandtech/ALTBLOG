import { Router } from "express";
import {
	handleCreateComment,
	handleAllComments,
	handleDeleteComment,
	handleCommentUsers,
	handleReplyComment,
	handleAllCommentReplies,
	handleDeleteCommentReply,
} from "../controllers/comment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { commentValidation } from "../validations/comment.validation.js";
import { validateMiddleware } from "../middlewares/validation.middleware.js";

const commentRoute = Router();
commentRoute.get("/:postId", handleAllComments);
commentRoute.get("/users/:postId", handleCommentUsers);
commentRoute.get("/reply/:commentId", handleAllCommentReplies);

commentRoute.use(authMiddleware);
commentRoute.post(
	"/",
	validateMiddleware(commentValidation),
	handleCreateComment
);
commentRoute.delete("/:commentId", handleDeleteComment);
commentRoute.post("/reply", handleReplyComment);
commentRoute.delete("/reply/replyId", handleDeleteCommentReply);
export default commentRoute;
