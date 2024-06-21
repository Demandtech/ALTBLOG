import { replyLikeModel } from "../databases/models/like.model.js";
import commentModel from "../databases/models/comment.model.js";
import replyModel from "../databases/models/reply.model.js";
import { ErrorAndStatus } from "../exceptions/errorandstatus.js";

export const createReply = async ({ commentId, userId, text }) => {
	if (!commentId || !userId || !text)
		throw new ErrorAndStatus("PostId, commenterId and text are required", 400);

	try {
		const comment = await commentModel.findById(commentId);
		if (!comment) throw new ErrorAndStatus("Comment not found", 404);

		let commentReply = await new replyModel({
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
		throw new ErrorAndStatus(
			error.message || "An error occured, please try again later!",
			error.status || 500
		);
	}
};

export const allReplies = async ({ commentId, userId, page }) => {
	if (!commentId) throw new ErrorAndStatus("comment Id is required", 400);

	const limit = 2;
	const skip = (page - 1) * limit;

	try {
		let replies = await replyModel
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

export const deleteReply = async ({ replyId, user }) => {
	if (!replyId) {
		throw new ErrorAndStatus("reply id is required", 400);
	}

	try {
		const reply = await replyModel.findById(replyId);

		if (!reply) {
			throw new ErrorAndStatus("reply not found!", 404);
		}

		if (reply.user.toString() != user._id && user.role !== "ADMIN") {
			throw new ErrorAndStatus("Access forbidden", 403);
		}

		await replyModel.findByIdAndDelete(replyId);
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
	if (!commentId) {
		throw new ErrorAndStatus("Comment Id is required", 400);
	}
	try {
		let replies = await replyModel
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
		throw new ErrorAndStatus(
			error.message || "Internal Server error, please try again later!",
			error.status || 500
		);
		console.log(error);
	}
};
