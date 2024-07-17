import mongoose from "mongoose";

const notificationSchema = mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	type: {
		type: String,
		required: true,
		enum: ["like", "comment", "subscribe"],
	},
	seen: {
		type: Boolean,
		default: false,
	},
	ownerId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	postId: {
		type: mongoose.Schema.Types.ObjectId,
        ref:"Post"
	},
});

export default notificationSchema;
