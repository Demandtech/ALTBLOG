import { createBlogPost } from "../services/blog.service.js";

export const handleCreateBlogPost = async (req, res) => {
	const { title, body, tags, author, state, description } = req.body;

	try {
		const newBlogPost = await createBlogPost(
			title,
			body,
			tags,
			author,
			state,
			description
		);

		res.status(201);
		res.json({
			message: "Post created successfully",
			post: newBlogPost,
		});
	} catch (error) {
		res.status(error?.status || 500);
		res.json({ message: error.message || "Internal Error" });
	}
};
