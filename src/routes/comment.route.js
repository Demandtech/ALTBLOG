import { Router } from "express";
import {
	handleCreateComment,
	handleAllComments,
	handleDeleteComment,
	handleCommentUsers,
	handleReplyComment,
	handleAllCommentReplies,
	handleDeleteCommentReply,
	handleReplyUsers
} from "../controllers/comment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
	commentValidation,
	replyCommentValidation,
} from "../validations/comment.validation.js";
import { validateMiddleware } from "../middlewares/validation.middleware.js";

const commentRoute = Router();
commentRoute.get("/:postId", handleAllComments);
commentRoute.get("/users/:postId", handleCommentUsers);
commentRoute.get("/reply/:commentId", handleAllCommentReplies);
commentRoute.get("/reply/users/:commentId", handleReplyUsers);

commentRoute.use(authMiddleware);
commentRoute.post(
	"/",
	validateMiddleware(commentValidation),
	handleCreateComment
);
commentRoute.post(
	"/reply",
	validateMiddleware(replyCommentValidation),
	handleReplyComment
);
commentRoute.delete("/:commentId", handleDeleteComment);
commentRoute.delete("/reply/replyId", handleDeleteCommentReply);
export default commentRoute;
