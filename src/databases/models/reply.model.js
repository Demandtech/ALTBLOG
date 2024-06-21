import mongoose from "mongoose";
import replySchema from "../schemas/reply.schema.js";

const replyModel = mongoose.model("Reply", replySchema);

export default replyModel;
