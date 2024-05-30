import blogModel from "../databases/models/blog.model.js";
import commentModel from "../databases/models/comment.model.js";
import {
	postLikeModel,
	commentLikeModel,
} from "../databases/models/like.model.js";
import { ErrorAndStatus } from "../exceptions/errorandstatus.js";

export const likePost = async ({ userId, postId }) => {
	const post = await blogModel.findById(postId);

	if (!post) throw new ErrorAndStatus("post not found", 404);

	if (!userId) throw new ErrorAndStatus("user id is required", 404);

	try {
		let filter = { user: userId, post: postId };

		const liked = await postLikeModel.findOne(filter);

		if (liked) {
			await postLikeModel.findByIdAndDelete(liked._id);

			return { message: "Post unliked successfully" };
		}

		const like = await new postLikeModel({ post: postId, user: userId });

		await like.save();

		return { message: "Post liked successfully" };
	} catch (error) {
		throw new ErrorAndStatus(
			error.message || "Internal error!",
			error.status || 500
		);
	}
};
export const likeComment = async ({ userId, commentId }) => {
	const comment = await commentModel.findById(commentId);

	if (!comment) throw new ErrorAndStatus("post not found", 404);

	if (!userId) throw new ErrorAndStatus("user id is required", 404);

	try {
		const liked = await commentLikeModel.findOne({
			user: userId,
			comment: commentId,
		});

		if (liked) {
			await commentLikeModel.findByIdAndDelete(liked._id);

			return { message: "Comment unliked successfully" };
		}

		const like = await new commentLikeModel({
			comment: commentId,
			user: userId,
		});

		await like.save();

		return { message: "Post liked successfully" };
	} catch (error) {
		throw new ErrorAndStatus(
			error.message || "Internal error!",
			error.status || 500
		);
	}
};
