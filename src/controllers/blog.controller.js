import {
	createBlogPost,
	allBlogPost,
	ownerBlogPosts,
	updatePostState,
} from "../services/blog.service.js";

export const handleCreateBlogPost = async (req, res) => {
	const { title, body, tags, state, description } = req.body;

	const author = req.user._id;

	try {
		const newBlogPost = await createBlogPost(
			title,
			body,
			tags,
			state,
			description,
			author
		);

		res.status(201);
		res.json({
			message: "Post created successfully",
			post: newBlogPost,
		});
	} catch (error) {
		res.status(error?.status || 500);
		res.json({ message: error.message || "Internal Error" });
		console.log(error.message);
	}
};

export const handleAllBlogPost = async (req, res) => {
	try {
		let page = Number(req.query.page) || 1;
		page = page < 1 ? 1 : page;
		let limit = Number(req.query.limit) || 5;
		limit = limit < 1 ? 5 : limit;
		const searchQuery = req.query.search;
		const blogPosts = await allBlogPost(page, limit, searchQuery);

		res.json({
			message: "All Blog posts",
			data: blogPosts,
		});
	} catch (error) {
		res.status(error.status || 500);
		res.json({ message: error.message || "Internal Error try again later" });
	}
};

export const handleOwnerBlogPosts = async (req, res) => {
	try {
		const userId = req.user._id;

		if (!userId) {
			res.status(400);
			return res.json({ message: "user id is required" });
		}

		let page = Number(req.query.page) || 1;
		page = page < 1 ? 1 : page;
		let limit = Number(req.query.limit) || 5;
		limit = limit < 1 ? 5 : limit;
		const state = req.query.state;

		const blogPosts = await ownerBlogPosts(userId, page, limit, state);

		return res.json({
			message: "all User Posts",
			data: blogPosts,
		});
	} catch (error) {
		return res.status(error.status || 500).json({ message: error.message });
	}
};

export const handleUpdateBlogPostState = async (req, res) => {
	const { id: postId } = req.params;
	const userId = req.user._id;

	if (!postId) {
		return res.status(400).json({ message: "Post id is required" });
	}

	if (!userId) {
		return res.status(400).json({ message: "User id is required" });
	}
	try {
		const updatedBlogPost = await updatePostState(postId, userId);

		return res.json({
			message: "Post Published successfully",
			data: updatedBlogPost,
		});
		
	} catch (error) {
		return res
			.status(error.status || 500)
			.json({ message: error.message || "Internal error try again!" });
	}
};
