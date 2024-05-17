import mongoose from "mongoose";
import likeSchema from "../schemas/like.schema.js";

const likeModel = mongoose.model("Like", likeSchema);

export default likeModel;
