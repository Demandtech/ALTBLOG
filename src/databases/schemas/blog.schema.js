import mongoose from "mongoose";

const blogSchema = mongoose.Schema(
	{
		body: {
			type: String,
			required: true,
			trim: true,
		},
		title: {
			type: String,
			required: true,
			trim: true,
			unique: true,
			lowercase: true,
		},
		description: {
			type: String,
		},
		tags: {
			type: [String],
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
			required: true,
		},
		read_count: {
			type: Number,
		},
		reading_time: {
			type: String,
		},
	},

	{ timestamps: true }
);

export default blogSchema;
