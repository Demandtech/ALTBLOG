import { bookmarkPost, bookmarkList } from "../services/bookmark.service.js";

export const handlebookmarkPost = async (req, res) => {
	try {
		const userId = req.user._id;
		const postId = req.params.id;

		const result = await bookmarkPost({ userId, postId });

		res.status(200).json(result);
	} catch (error) {
		res.status(error.status || 500).json({
			message: error.message || "An error occured, please try again!",
		});
	}
};

export const handleBookmarkList = async (req, res) => {
	try {
		const userId = req.user._id;

		const result = await bookmarkList(userId);

		res.json({ data: result });
	} catch (error) {
		res.status(error.status || 500).json({
			message: error.message || "An error occured, please try again!",
		});
	}
};
