import mongoose from "mongoose";

const commentSchema = mongoose.Schema(
	{
		post: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Blog",
			required: true,
		},
		text: {
			type: String,
			trim: true,
			required: true,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{ timestamps: true }
);

export default commentSchema;
