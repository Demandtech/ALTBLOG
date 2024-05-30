import mongoose from "mongoose";
import { postLikeSchema, commentLikeSchema } from "../schemas/like.schema.js";

export const postLikeModel = mongoose.model("PostLike", postLikeSchema);
export const commentLikeModel = mongoose.model("CommentLike", commentLikeSchema);

