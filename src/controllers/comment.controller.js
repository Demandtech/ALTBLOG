import {
	createComment,
	allComments,
	deleteComment,
	commentUsers,
	replyUsers,
	allCommentReplies,
	replyComment,
	deleteCommentReply,
} from "../services/comment.service.js";
import { checkAuthenticate } from "../helpers/checkAuthentication.js";

export const handleCreateComment = async (req, res) => {
	const { postId, userId, text } = req.body;
	try {
		const newComment = await createComment({ postId, userId, text });
		res.json({ data: newComment });
	} catch (error) {
		res.status(error.status || 500).json({
			message: error.message || "An error occured, try again later",
			data: null,
		});
	}
};

export const handleAllComments = async (req, res) => {
	const authorization = req.headers.authorization;
	const { postId } = req.params;
	const page = req.query.page;
	let userId = checkAuthenticate(authorization);
	try {
		const comments = await allComments({ postId, page, userId });
		res.json({ data: comments });
	} catch (error) {
		res.status(error.status || 500).json({
			message: error.message || "An error occured, try again later",
			data: null,
		});
	}
};

export const handleDeleteComment = async (req, res) => {
	const { commentId } = req.params;

	console.log(commentId);

	if (!commentId) {
		return res.status(400).json({ message: "post id is required" });
	}

	try {
		const isDeleted = await deleteComment({ commentId, user: req.user });

		if (isDeleted) {
			return res.json({ message: "Comment deleted successfully" });
		} else {
			return res.status(400).json({ message: "something is wrong, try again" });
		}
	} catch (error) {
		res
			.status(error.status || 500)
			.json({ message: error.message || "Internal server error! try again" });
	}
};

export const handleCommentUsers = async (req, res) => {
	const postId = req.params.postId;

	try {
		const users = await commentUsers(postId);

		res.json({ data: users });
	} catch (error) {
		console.log(error);
	}
};

export const handleReplyComment = async (req, res) => {
	const { commentId, userId, text } = req.body;
	try {
		const newReply = await replyComment({ commentId, userId, text });
		res.json({ data: newReply });
	} catch (error) {
		res.status(error.status || 500).json({
			message: error.message || "An error occured, try again later",
			data: null,
		});
	}
};

export const handleAllCommentReplies = async (req, res) => {
	const authorization = req.headers.authorization;
	const { commentId } = req.params;
	const page = req.query.page;
	let userId = checkAuthenticate(authorization);
	try {
		const commentReplies = await allCommentReplies({ commentId, page, userId });
		res.json({ data: commentReplies });
	} catch (error) {
		res.status(error.status || 500).json({
			message: error.message || "An error occured, try again later",
			data: null,
		});
	}
};

export const handleDeleteCommentReply = async (req, res) => {
	const { replyId } = req.params;

	if (!commentId) {
		return res.status(400).json({ message: "reply id is required" });
	}

	try {
		const isDeleted = await deleteCommentReply({ replyId, user: req.user });

		if (isDeleted) {
			return res.json({ message: "reply deleted successfully" });
		} else {
			return res.status(400).json({ message: "something is wrong, try again" });
		}
	} catch (error) {
		res
			.status(error.status || 500)
			.json({ message: error.message || "Internal server error! try again" });
	}
};

export const handleReplyUsers = async (req, res) => {
	const { commentId } = req.params;

	try {
		const users = await replyUsers(commentId);

		res.json({ data: users });
	} catch (error) {
		console.log(error);
	}
};
