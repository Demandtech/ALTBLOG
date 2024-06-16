import {
	likePost,
	likeComment,
	likePostUsers,
} from "../services/like.service.js";

export const handleLikePost = async (req, res) => {
	try {
		const userId = req.user._id;
		const { postId } = req.params;

		const result = await likePost({ userId, postId });

		res.status(200).json(result);
	} catch (error) {
		res.status(error.status || 500).json({
			message: error.message || "An error occured, please try again!",
		});
	}
};

export const handleLikeComment = async (req, res) => {
	try {
		const userId = req.user._id;
		const { commentId } = req.params;

		const result = await likeComment({ userId, commentId });

		res.status(200).json(result);
	} catch (error) {
		res.status(error.status || 500).json({
			message: error.message || "An error occured, please try again!",
		});
	}
};

export const handleLikePostUsers = async (req, res) => {
	const postId = req.params.postId;

	try {
		const users = await likePostUsers(postId);

		res.json({ data: users });
	} catch (error) {
		console.log(error);
	}
};
