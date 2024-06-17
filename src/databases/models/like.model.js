import mongoose, { mongo } from "mongoose";
import {
	postLikeSchema,
	commentLikeSchema,
	ReplyLikeSchema,
} from "../schemas/like.schema.js";

export const postLikeModel = mongoose.model("PostLike", postLikeSchema);
export const commentLikeModel = mongoose.model(
	"CommentLike",
	commentLikeSchema
);
export const replyLikeModel = mongoose.model("ReplyLike", ReplyLikeSchema);
