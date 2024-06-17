import blogModel from "../databases/models/post.model.js";
import commentModel from "../databases/models/comment.model.js";
import {
	postLikeModel,
	commentLikeModel,
	replyLikeModel,
} from "../databases/models/like.model.js";
import { ErrorAndStatus } from "../exceptions/errorandstatus.js";
import commentReplyModel from "../databases/models/commentReply.model.js";

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

export const likePostUsers = async (postId) => {
	if (!postId) {
		throw new ErrorAndStatus("Post Id is required", 400);
	}
	try {
		let comments = await postLikeModel
			.find({ post: postId })
			.populate({
				path: "user",
				select: "first_name last_name avatar profession",
			})
			.lean();

		let users = comments.map((comment) => comment.user);

		users = users.reduce((acc, current) => {
			const x = acc.find((item) => item._id === current._id);
			if (!x) {
				return acc.concat([current]);
			} else {
				return acc;
			}
		}, []);

		// console.log(users);
		return { message: "All Post Like Users", data: users };
	} catch (error) {
		console.log(error);
	}
};

export const likeCommentReply = async ({ userId, replyId }) => {
	const reply = await commentReplyModel.findById(replyId);

	console.log({ userId, replyId });

	if (!reply) throw new ErrorAndStatus("Reply not found", 404);

	if (!userId) throw new ErrorAndStatus("user id is required", 404);

	try {
		const liked = await replyLikeModel.findOne({
			user: userId,
			reply: replyId,
		});

		if (liked) {
			await replyLikeModel.findByIdAndDelete(liked._id);

			return { message: "Reply unliked successfully" };
		}

		const like = await new replyLikeModel({
			reply: replyId,
			user: userId,
		});

		await like.save();

		return { message: "Reply liked successfully" };
	} catch (error) {
		console.log(error);
		throw new ErrorAndStatus(
			error.message || "Internal error!",
			error.status || 500
		);
	}
};

export const likeCommentUsers = async (commentId) => {
	if (!commentId) {
		throw new ErrorAndStatus("Comment Id is required", 400);
	}
	try {
		let comments = await commentLikeModel
			.find({ comment: commentId })
			.populate({
				path: "user",
				select: "first_name last_name avatar profession",
			})
			.lean();

		let users = comments.map((comment) => comment.user);

		users = users.reduce((acc, current) => {
			const x = acc.find((item) => item._id === current._id);
			if (!x) {
				return acc.concat([current]);
			} else {
				return acc;
			}
		}, []);

		// console.log(users);
		return { message: "All Comment Like Users", data: users };
	} catch (error) {
		console.log(error);
	}
};
