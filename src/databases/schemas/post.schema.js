import mongoose from "mongoose";
import bookmarkSchema from "./bookmark.schema.js";
import commentSchema from "./comment.schema.js";
import { postLikeSchema } from "./like.schema.js";

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
		read_count: {
			type: Number,
			default: 0,
			required: true,
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

postSchema.pre("remove", function (next) {
	console.log("CALLED");
	try {
		// await postLikeSchema.deleteMany({ post: this._id });
		postLikeSchema.remove({ post: this._id }).exec();
		next();
	} catch (err) {
		next(err);
	}
});

export default postSchema;
