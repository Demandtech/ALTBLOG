import mongoose from "mongoose";

const viewSchema = mongoose.Schema({
	postId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Post",
		required: true,
	},
	view: {
		type: Number,
		require: true,
		default: 0,
	},
	userIp: {
		type: String,
		require: true,
	},
});
export default viewSchema;
