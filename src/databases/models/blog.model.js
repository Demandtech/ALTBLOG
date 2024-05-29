import mongoose from "mongoose";
import blogSchema from "../schemas/blog.schema.js";

const blogModel = mongoose.model("Blog", blogSchema);

blogModel.createIndexes({
	title: "text",
	category: "text",
	tags: "text",
});

export default blogModel;
