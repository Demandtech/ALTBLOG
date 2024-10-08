import blogModel from "../databases/models/post.model.js";
import commentModel from "../databases/models/comment.model.js";
import { commentLikeModel } from "../databases/models/like.model.js";
import { ErrorAndStatus } from "../exceptions/errorandstatus.js";
import replyModel from "../databases/models/reply.model.js";

export const createComment = async ({ postId, userId, text }) => {

	try {
		const post = await blogModel.findById(postId);
		if (!post) throw new ErrorAndStatus("Post not found", 404);

		let comment = await new commentModel({
			post: postId,
			user: userId,
			text,
		});

		await comment.save();

		comment = await comment.populate({
			path: "user",
			select: "first_name avatar last_name profession",
		});

		return { message: "comment submitted successfully", data: comment };
		
	} catch (error) {
		throw new ErrorAndStatus(
			error.message || "An error occured, please try again later!",
			error.status || 500
		);
	}
};

export const allComments = async ({ postId, userId, page }) => {
	if (!postId) throw new ErrorAndStatus("post Id is required", 400);

	const limit = 2;
	const skip = (page - 1) * limit;
	try {
		let comments = await commentModel
			.find({ post: postId })
			.skip(skip)
			.limit(limit + 1)
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "first_name last_name avatar profession",
			})
			.lean();

		const userLikes = await commentLikeModel.find({ user: userId }).lean();
		const likeCommentId = new Set(
			userLikes.map((like) => like.comment.toString())
		);
		let isLiked = false;

		comments = await Promise.all(
			comments.map(async (com) => {
				const commentLikes = await commentLikeModel
					.find({ comment: com._id })
					.lean();
				const replies = await replyModel
					.find({
						comment: com._id,
					})
					.lean();
				const likeCount = commentLikes.length || 0;
				const replyCount = replies.length || 0;

				if (userId) {
					isLiked = likeCommentId.has(com._id.toString());
				}
				return { ...com, likeCount, isLiked, replyCount };
			})
		);

		const hasMore = comments.length > limit;

		const response = hasMore ? comments.slice(0, limit) : comments;

		const result = { hasMore, comments: response };

		// console.log(result);

		return { message: "All Post comments", data: result };
	} catch (error) {
		throw new ErrorAndStatus(
			error.message || "An error occured",
			error.status || 500
		);
	}
};

export const deleteComment = async ({ commentId, user }) => {
	if (!commentId) {
		throw new ErrorAndStatus("comment id is required", 400);
	}

	try {
		const comment = await commentModel.findById(commentId);

		if (!comment) {
			throw new ErrorAndStatus("comment not found!", 404);
		}

		if (comment.user.toString() != user._id && user.role !== "ADMIN") {
			throw new ErrorAndStatus("Access forbidden", 403);
		}

		await commentModel.findByIdAndDelete(commentId);
		await commentLikeModel.deleteMany({ comment: commentId });
		return true;
	} catch (error) {
		throw new ErrorAndStatus(
			error.message || "an error occured, try again later",
			error.status || 500
		);
	}
};

export const commentUsers = async (postId) => {
	if (!postId) {
		throw new ErrorAndStatus("Post Id is required", 400);
	}
	try {
		let comments = await commentModel
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
		return { message: "All Post comment Users", data: users };
	} catch (error) {
		console.log(error);
	}
};
