import {
	createBlogPost,
	allPublishedBlogPost,
	authorBlogPosts,
	publishBlogPost,
	singleBlogPost,
	updateBlogPost,
	deleteBlogPost,
	allBlogPost,
	featuredPost,
} from "../services/blog.service.js";
import Jwt from "jsonwebtoken";

export const handleCreateBlogPost = async (req, res) => {
	const { title, body, tags, description, category } = req.body;

	const author = req.user._id;

	try {
		const newBlogPost = await createBlogPost({
			title,
			body,
			tags,
			description,
			author,
			category,
		});

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
	// logger.info("Post route accessed");
	const authorization = req.headers.authorization;
	try {
		let userId;
		if (authorization) {
			const [bearer, token] = authorization.split(" ");

			const jwtsec = process.env.JWT_SECRET;

			const decoded = Jwt.verify(token, jwtsec);

			userId = decoded._id;
		}
		let page = Number(req.query.page) || 1;
		page = page < 1 ? 1 : page;
		let limit = Number(req.query.limit) || 5;
		limit = limit < 1 ? 5 : limit;
		const searchQuery = req.query.search;
		const category = req.query.category;
		const order = req.query.order || "timestamp";
		const blogPosts = await allPublishedBlogPost({
			page,
			limit,
			searchQuery,
			order,
			userId,
			category,
		});

		res.status(200).json({
			message: "All Blog posts",
			data: blogPosts,
		});
	} catch (error) {
		res.status(error.status || 500);
		res.json({ message: error.message || "Internal Error try again later" });
	}
};

export const handleAuthorBlogPosts = async (req, res) => {
	let authorId = req.params.id;
	const authorization = req.headers.authorization;

	try {
		let userId;
		if (authorization) {
			const [bearer, token] = authorization.split(" ");

			const jwtsec = process.env.JWT_SECRET;

			const decoded = Jwt.verify(token, jwtsec);

			userId = decoded._id;
		}

		if (!authorId) {
			res.status(400);
			return res.json({ message: "user id is required" });
		}

		let page = Number(req.query.page) || 1;
		page = page < 1 ? 1 : page;
		let limit = Number(req.query.limit) || 5;
		limit = limit < 1 ? 12 : limit;
		const search = req.query.search;
		const order = req.query.order;
		const state = req.query.state;

		const blogPosts = await authorBlogPosts({
			authorId,
			userId,
			page,
			limit,
			search,
			order,
			state,
		});

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

	if (!postId) {
		return res.status(400).json({ message: "Post id param is required!" });
	}

	try {
		let authId;
		if (authorization) {
			const [bearer, token] = authorization.split(" ");

			const jwtsec = process.env.JWT_SECRET;

			const decoded = Jwt.verify(token, jwtsec);

			authId = decoded._id;
		}
		const blogPost = await singleBlogPost(postId, authId);

		if (!blogPost) {
			return res.status(404).json({ message: "Blog post not found!" });
		}
		res.json({
			message: "Single Blog Post",
			data: blogPost,
		});
	} catch (error) {
		if (
			error.name === "JsonWebTokenError" ||
			error.name === "TokenExpiredError"
		) {
			return res.status(401).json({ message: "Unauthorized access" });
		}
		return res
			.status(error.status || 500)
			.json({ message: error.message || "Internal error, try again later!" });
	}
};

// 	try {
// 		let userId = req.user._id;

// 		if (!userId) {
// 			res.status(400);
// 			return res.json({ message: "user id is required" });
// 		}

// 		let page = Number(req.query.page) || 1;
// 		page = page < 1 ? 1 : page;
// 		let limit = Number(req.query.limit) || 12;
// 		limit = limit < 1 ? 12 : limit;
// 		const search = req.query.state;
// 		const order = req.query.order;

// 		const blogPosts = await allPersonalBlogPosts(
// 			userId,
// 			page,
// 			limit,
// 			search,
// 			order
// 		);

// 		return res.json({
// 			message: "all Personal Posts",
// 			data: blogPosts,
// 		});
// 	} catch (error) {
// 		return res.status(error.status || 500).json({ message: error.message });
// 	}
// };

export const handleUpdateBlogPost = async (req, res) => {
	const postId = req.params.postId;
	const { title, description, body, tags, category } = req.body;
	const userId = req.user._id;

	if (!postId) {
		res.status(400).json({ message: "post id param is requrired" });
	}

	try {
		const updatedPost = await updateBlogPost(
			postId,
			{ title, description, body, tags, category },
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

export const handleDeleteBlogPost = async (req, res) => {
	const postId = req.params.postId;

	if (!postId) {
		return res.status(400).json({ message: "post id is required" });
	}

	try {
		const isDeleted = await deleteBlogPost(postId, req.user);

		if (isDeleted) {
			return res.json({ message: "Post deleted successfully" });
		} else {
			return res
				.status(400)
				.json({ message: "post can not be deleted, try again" });
		}
	} catch (error) {
		res
			.status(error.status || 500)
			.json({ message: error.message || "Inter server error! try again" });
	}
};

export const handleAllBlogPost = async (req, res) => {
	try {
		let page = Number(req.query.page) || 1;
		page = page < 1 ? 1 : page;
		let limit = Number(req.query.limit) || 5;
		limit = limit < 1 ? 5 : limit;
		const searchQuery = req.query.search;
		const order = req.query.order || "timestamp";
		const state = req.query.state;
		const blogPosts = await allBlogPost(page, limit, searchQuery, order, state);

		res.json({
			message: "All Blog posts",
			data: blogPosts,
		});
	} catch (error) {
		res.status(error.status || 500);
		res.json({ message: error.message || "Internal Error try again later" });
	}
};

export const handleFeaturedPost = async (req, res) => {
	try {
		const posts = await featuredPost();

		res.json({ message: "Featured posts", data: posts });
	} catch (error) {
		return res
			.status(error.status || 500)
			.json({ message: error.message || "An error occured, try again!" });
	}
};
