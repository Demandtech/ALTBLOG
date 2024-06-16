import mongoose from "mongoose";
import postSchema from "../schemas/post.schema.js";

const postModel = mongoose.model("Blog", postSchema);

export default postModel;
