import {
	replyUsers,
	allReplies,
	createReply,
	deleteReply,
} from "../services/reply.service.js";
import { checkAuthenticate } from "../helpers/checkAuthentication.js";

export const handleCreateReply = async (req, res) => {
	const { commentId, userId, text } = req.body;
	try {
		const newReply = await createReply({ commentId, userId, text });
		res.json({ data: newReply });
	} catch (error) {
		res.status(error.status || 500).json({
			message: error.message || "An error occured, try again later",
			data: null,
		});
	}
};

export const handleAllReplies = async (req, res) => {
	const authorization = req.headers.authorization;
	const { commentId } = req.params;
	const page = req.query.page;
	let userId = checkAuthenticate(authorization);
	try {
		const commentReplies = await allReplies({ commentId, page, userId });
		res.json({ data: commentReplies });
	} catch (error) {
		res.status(error.status || 500).json({
			message: error.message || "An error occured, try again later",
			data: null,
		});
	}
};

export const handleDeleteReply = async (req, res) => {
	const { replyId } = req.params;

	if (!replyId) {
		return res.status(400).json({ message: "reply id is required" });
	}

	try {
		const isDeleted = await deleteReply({ replyId, user: req.user });

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
