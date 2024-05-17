import mongoose from "mongoose";

const likeSchema = mongoose.Schema({
	post: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Blog",
		required: true,
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
});

export default likeSchema;
