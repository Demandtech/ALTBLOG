import mongoose from "mongoose";

const bookmarkSchema = mongoose.Schema({
	post: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Post",
		required: true,
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
});

export default bookmarkSchema;
