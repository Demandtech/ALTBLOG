import { likePost } from "../services/like.service.js";

export const handleLikePost = async (req, res) => {
	try {
		const userId = req.user._id;
		const postId = req.params.id;

		const result = await likePost({ userId, postId });

		res.status(200).json(result);
	} catch (error) {
		res
			.status(error.status || 500)
			.json({
				message: error.message || "An error occured, please try again!",
			});
	}
};
