import { Router } from "express";
import { validateMiddleware } from "../middlewares/validation.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import replyValidation from "../validations/reply.validation.js";
import {
	handleCreateReply,
	handleDeleteReply,
	handleAllReplies,
	handleReplyUsers,
} from "../controllers/reply.controller.js";

const replyRoute = Router();

replyRoute.get("/:commentId", handleAllReplies);
replyRoute.get("/users/:commentId", handleReplyUsers);

replyRoute.use(authMiddleware);

replyRoute.post("/", validateMiddleware(replyValidation), handleCreateReply);
replyRoute.delete("/:replyId", handleDeleteReply);

export default replyRoute;
