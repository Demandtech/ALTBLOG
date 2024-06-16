import mongoose from "mongoose";
import commentSchema from "../schemas/comment.schema.js";

const commentModel = mongoose.model("Reply", commentSchema);

export default commentModel;
