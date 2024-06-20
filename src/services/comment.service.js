import blogModel from "../databases/models/post.model.js";
import commentModel from "../databases/models/comment.model.js";
import {
	commentLikeModel,
	replyLikeModel,
} from "../databases/models/like.model.js";
import { ErrorAndStatus } from "../exceptions/errorandstatus.js";
import commentReplyModel from "../databases/models/commentReply.model.js";

export const createComment = async ({ postId, userId, text }) => {
	if (!postId || !userId || !text)
		throw new ErrorAndStatus("PostId, commenterId and text are required", 400);

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

	console.log(postId);

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
				const commentReplies = await commentReplyModel
					.find({
						comment: com._id,
					})
					.lean();
				const likeCount = commentLikes.length || 0;
				const replyCount = commentReplies.length || 0;

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

export const replyComment = async ({ commentId, userId, text }) => {
	if (!commentId || !userId || !text)
		throw new ErrorAndStatus("PostId, commenterId and text are required", 400);

	try {
		const comment = await commentModel.findById(commentId);
		if (!comment) throw new ErrorAndStatus("Comment not found", 404);

		let commentReply = await new commentReplyModel({
			comment: commentId,
			user: userId,
			text,
		});

		await commentReply.save();

		commentReply = await commentReply.populate({
			path: "user",
			select: "first_name avatar last_name profession",
		});

		return { message: "Reply submitted successfully", data: commentReply };
	} catch (error) {
		console.log(error);
		throw new ErrorAndStatus(
			error.message || "An error occured, please try again later!",
			error.status || 500
		);
	}
};

export const allCommentReplies = async ({ commentId, userId, page }) => {
	if (!commentId) throw new ErrorAndStatus("comment Id is required", 400);
	console.log({ commentId, userId, page });
	const limit = 2;
	const skip = (page - 1) * limit;

	try {
		let replies = await commentReplyModel
			.find({ comment: commentId })
			.skip(skip)
			.limit(limit + 1)
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "first_name last_name avatar profession",
			})
			.lean();

		const userReplies = await replyLikeModel.find({ user: userId }).lean();
		const likeReplyId = new Set(
			userReplies.map((like) => like.reply.toString())
		);
		let isLiked = false;

		replies = await Promise.all(
			replies.map(async (reply) => {
				const replyLikes = await replyLikeModel
					.find({ reply: reply._id })
					.lean();

				console.log(replyLikes);

				const likeCount = replyLikes.length || 0;

				if (userId) {
					isLiked = likeReplyId.has(reply._id.toString());
				}
				return { ...reply, likeCount, isLiked };
			})
		);

		const hasMore = replies.length > limit;

		const response = hasMore ? replies.slice(0, limit) : replies;

		const result = { hasMore, replies: response };

		return { message: "All Comment replies", data: result };
	} catch (error) {
		throw new ErrorAndStatus(
			error.message || "An error occured",
			error.status || 500
		);
	}
};

export const deleteCommentReply = async ({ replyId, user }) => {
	if (!replyId) {
		throw new ErrorAndStatus("reply id is required", 400);
	}

	try {
		const reply = await commentReplyModel.findById(replyId);

		if (!reply) {
			throw new ErrorAndStatus("reply not found!", 404);
		}

		if (reply.user.toString() != user._id && user.role !== "ADMIN") {
			throw new ErrorAndStatus("Access forbidden", 403);
		}

		await commentReplyModel.findByIdAndDelete(replyId);
		// await commentLikeModel.deleteMany({ comment: reply.comment });

		return true;
	} catch (error) {
		throw new ErrorAndStatus(
			error.message || "an error occured, try again later",
			error.status || 500
		);
	}
};

export const replyUsers = async (commentId) => {
	console.log(commentId)
	if (!commentId) {
		throw new ErrorAndStatus("Comment Id is required", 400);
	}
	try {
		let replies = await commentReplyModel
			.find({ comment: commentId })
			.populate({
				path: "user",
				select: "first_name last_name avatar profession",
			})
			.lean();

		let users = replies.map((reply) => reply.user);

		users = users.reduce((acc, current) => {
			const x = acc.find((item) => item._id === current._id);
			if (!x) {
				return acc.concat([current]);
			} else {
				return acc;
			}
		}, []);

		return { message: "All Post comment Users", data: users };
	} catch (error) {
		console.log(error);
	}
};
