import {
	createBlogPost,
	allBlogPost,
	authorBlogPosts,
	publishBlogPost,
	singleBlogPost,
} from "../services/blog.service.js";
import Jwt from "jsonwebtoken";

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

export const handleAuthorBlogPosts = async (req, res) => {
	try {
		let userId = req.params.id;

		if (!userId) {
			res.status(400);
			return res.json({ message: "user id is required" });
		}

		let page = Number(req.query.page) || 1;
		page = page < 1 ? 1 : page;
		let limit = Number(req.query.limit) || 5;
		limit = limit < 1 ? 5 : limit;
		const search = req.query.search;

		const blogPosts = await authorBlogPosts(userId, page, limit, search);

		return res.json({
			message: "all User Posts",
			data: blogPosts,
		});

	} catch (error) {
		return res.status(error.status || 500).json({ message: error.message });
	}
};

export const handlePublishBlogPost = async (req, res) => {
	const { id: postId } = req.params;
	const userId = req.user._id;

	if (!postId) {
		return res.status(400).json({ message: "Post id is required" });
	}

	if (!userId) {
		return res.status(400).json({ message: "User id is required" });
	}
	try {
		const publishedBlogPost = await publishBlogPost(postId, userId);

		return res.json({
			message: "Post Published successfully",
			data: publishBlogPost,
		});
	} catch (error) {
		return res
			.status(error.status || 500)
			.json({ message: error.message || "Internal error try again!" });
	}
};

export const handleSingleBlogPost = async (req, res) => {
	const postId = req.params.postId;

	const authorization = req.headers.authorization;

	let userId;

	if (authorization) {

		const [bearer, token] = authorization.split(" ");

		const jwtsec = process.env.JWT_SECRET;

		const decoded = Jwt.verify(token, jwtsec);

		userId = decoded._id;

	}

	if (!postId) {
		return res.status(400).json({ message: "Post id param is required!" });
	}

	try {
		const blogPost = await singleBlogPost(postId, userId);

		if (!blogPost) {
			return res.status(404).json({ message: "Blog post not found!" });
		}
		res.json({
			message: "Single Blog Post",
			data: blogPost,
		});
	} catch (error) {
		return res
			.status(error.status || 500)
			.json({ message: error.message || "Internal error, try again later!" });
	}
};
