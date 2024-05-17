import mongoose from "mongoose";
import bookmarkSchema from "../schemas/bookmark.schema.js";

const bookmarkModel = mongoose.model("Bookmark", bookmarkSchema);

export default bookmarkModel;
