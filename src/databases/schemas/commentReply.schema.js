import mongoose from "mongoose";

const commentReplySchema = mongoose.Schema(
	{
		comment: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment",
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

export default commentReplySchema;
