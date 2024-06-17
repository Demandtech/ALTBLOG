import mongoose from "mongoose";

export const postLikeSchema = mongoose.Schema(
	{
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
	},
	{ timestamps: true }
);

export const commentLikeSchema = mongoose.Schema(
	{
		comment: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment",
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

export const ReplyLikeSchema = mongoose.Schema(
	{
		reply: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Reply",
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