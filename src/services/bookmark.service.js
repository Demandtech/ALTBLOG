import blogModel from "../databases/models/blog.model.js";
import bookmarkModel from "../databases/models/bookmark.model.js";
import { ErrorAndStatus } from "../exceptions/errorandstatus.js";

export const bookmarkPost = async ({ userId, postId }) => {
	const post = await blogModel.findById(postId);

	if (!post) throw new ErrorAndStatus("post not found", 404);

	if (!userId) throw new ErrorAndStatus("user id is required", 404);

	try {
		let filter = { user: userId, post: postId };

		const bookmarked = await bookmarkModel.findOne(filter);

		if (bookmarked) {
			await bookmarkModel.findByIdAndDelete(bookmarked._id);

			return { message: "Post removed from your bookmark successfully " };
		}

		const bookmark = await new bookmarkModel({ post: postId, user: userId });

		await bookmark.save();

		return { message: `Post added to your bookmark successfully  ` };
	} catch (error) {
		throw new ErrorAndStatus(
			error.message || "Internal error!",
			error.status || 500
		);
	}
};

export const bookmarkList = (userId) => {
	if (!userId) throw new ErrorAndStatus("User id is required", 400);
	try {
		let bookmarks = bookmarkModel.find({ user: userId }).populate({
			path: "post",
		}).lean();
		

		// bookmarks = bookmarks.toObject();

		// delete bookmarks.user;
		// delete bookmarks.__v;

		return bookmarks;
	} catch (error) {
		throw new ErrorAndStatus(
			error.message || "Internal server error, please try again!",
			error.status || 500
		);
	}
};
