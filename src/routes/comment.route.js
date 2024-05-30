import { Router } from "express";
import {
	handleCreateComment,
	handleAllComments,
	handleDeleteComment,
} from "../controllers/comment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { commentValidation } from "../validations/comment.validation.js";
import { validateMiddleware } from "../middlewares/validation.middleware.js";
import { handleLikeComment } from "../controllers/like.controller.js";

const commentRoute = Router();
commentRoute.get("/:id", handleAllComments);
commentRoute.use(authMiddleware);
commentRoute.post(
	"/",
	validateMiddleware(commentValidation),
	handleCreateComment
);
commentRoute.get("/like/:id", handleLikeComment);
commentRoute.delete("/:id", handleDeleteComment);
export default commentRoute;
