import mongoose from "mongoose";

const postSchema = mongoose.Schema(
	{
		body: {
			type: String,
			required: true,
			trim: true,
			// maxlength: 100000,
		},
		title: {
			type: String,
			required: true,
			trim: true,
			unique: true,
		},
		description: {
			type: String,
		},
		tags: {
			type: [String],
			trim: true,
		},
		category: {
			type: String,
			trim: true,
		},
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		state: {
			type: String,
			enum: ["DRAFT", "PUBLISHED"],
			default: "DRAFT",
		},
		reading_time: {
			type: Number,
			default: 0,
			required: true,
		},
		publishedAt: {
			type: Date,
		},
		featured: {
			type: Boolean,
			default: false,
		},
	},

	{ timestamps: true }
);

export default postSchema;
