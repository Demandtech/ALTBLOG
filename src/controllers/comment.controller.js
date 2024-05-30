import { createComment, allComments, deleteComment } from "../services/comment.service.js";
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
	const postId = req.params.id;
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
	const commentId = req.params.id;

	console.log(commentId)

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
