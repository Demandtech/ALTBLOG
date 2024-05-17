import blogModel from "../databases/models/blog.model.js";
import likeModel from "../databases/models/like.model.js";
import { ErrorAndStatus } from "../exceptions/errorandstatus.js";

export const likePost = async ({ userId, postId }) => {
	const post = await blogModel.findById(postId);

	if (!post) throw new ErrorAndStatus("post not found", 404);

	if (!userId) throw new ErrorAndStatus("user id is required", 404);

	try {
		let filter = { user: userId, post: postId };

		const liked = await likeModel.findOne(filter);

		if (liked) {
			await likeModel.findByIdAndDelete(liked._id);

			return { message: "Post unliked successfully" };
		}

		const like = await new likeModel({ post: postId, user: userId });

		await like.save();

		return { message: "Post liked successfully" };
		
	} catch (error) {
		throw new ErrorAndStatus(
			error.message || "Internal error!",
			error.status || 500
		);
	}
};
