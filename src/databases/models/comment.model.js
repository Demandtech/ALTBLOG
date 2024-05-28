import mongoose from "mongoose";
import commentSchema from "../schemas/comment.schema.js";

const commentModel = mongoose.model("Comment", commentSchema);

export default commentModel;
