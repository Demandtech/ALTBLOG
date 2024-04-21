import {
	createBlogPost,
	allPublishedBlogPost,
	authorPublishedBlogPosts,
	publishBlogPost,
	singleBlogPost,
	allPersonalBlogPosts,
	updateBlogPost,
} from "../services/blog.service.js";
import Jwt from "jsonwebtoken";

export const handleCreateBlogPost = async (req, res) => {
	const { title, body, tags, description } = req.body;

	const author = req.user._id;

	try {
		const newBlogPost = await createBlogPost(
			title,
			body,
			tags,
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

export const handleAllPublishedBlogPost = async (req, res) => {
	try {
		let page = Number(req.query.page) || 1;
		page = page < 1 ? 1 : page;
		let limit = Number(req.query.limit) || 5;
		limit = limit < 1 ? 5 : limit;
		const searchQuery = req.query.search;
		const order = req.query.order || "timestamp";
		const blogPosts = await allPublishedBlogPost(
			page,
			limit,
			searchQuery,
			order
		);

		res.json({
			message: "All Blog posts",
			data: blogPosts,
		});
	} catch (error) {
		res.status(error.status || 500);
		res.json({ message: error.message || "Internal Error try again later" });
	}
};

export const handleAuthorPublishedBlogPosts = async (req, res) => {
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
		const order = req.query.order;

		const blogPosts = await authorPublishedBlogPosts(
			userId,
			page,
			limit,
			search,
			order
		);

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
			data: publishedBlogPost,
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

	try {
		if (authorization) {
			const [bearer, token] = authorization.split(" ");

			const jwtsec = process.env.JWT_SECRET;

			const decoded = Jwt.verify(token, jwtsec);

			userId = decoded._id;
		}

		if (!postId) {
			return res.status(400).json({ message: "Post id param is required!" });
		}

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

export const handleAllPersonalBlogPosts = async (req, res) => {
	try {
		let userId = req.user._id;

		if (!userId) {
			res.status(400);
			return res.json({ message: "user id is required" });
		}

		let page = Number(req.query.page) || 1;
		page = page < 1 ? 1 : page;
		let limit = Number(req.query.limit) || 5;
		limit = limit < 1 ? 5 : limit;
		const search = req.query.state;
		const order = req.query.order;

		const blogPosts = await allPersonalBlogPosts(
			userId,
			page,
			limit,
			search,
			order
		);

		return res.json({
			message: "all Personal Posts",
			data: blogPosts,
		});
	} catch (error) {
		return res.status(error.status || 500).json({ message: error.message });
	}
};

export const handleUpdateBlogPost = async (req, res) => {
	const postId = req.params.postId;
	const { title, description, body, tags } = req.body;
	const userId = req.user._id;

	if (!postId) {
		res.status(400).json({ message: "post id param is requrired" });
	}
	try {
		const updatedPost = await updateBlogPost(
			postId,
			{ title, description, body, tags },
			userId
		);

		if (!updatedPost) {
			return res.status(404).json({ message: "Post not found" });
		}

		res.json({ message: "Post updated Successfully", data: updatedPost });
		
	} catch (error) {
		res
			.status(error.status || 500)
			.json({ message: error.message || "Internal server error" });
	}
};
