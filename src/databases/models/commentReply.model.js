import mongoose from "mongoose";
import commentReplySchema from "../schemas/commentReply.schema.js";

const commentReplyModel = mongoose.model("Comment", commentReplySchema);

export default commentReplyModel;
