import mongoose from "mongoose";
import postSchema from "../schemas/post.schema.js";

const postModel = mongoose.model("Post", postSchema);

export default postModel;
