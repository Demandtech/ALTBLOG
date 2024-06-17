import mongoose from "mongoose";
import commentReplySchema from "../schemas/commentReply.schema.js";

const commentReplyModel = mongoose.model("Reply", commentReplySchema);

export default commentReplyModel;
