import blogModel from "../databases/models/blog.model.js";
import { ErrorAndStatus } from "../exceptions/errorandstatus.js";
import calculateReadingTime from "../helpers/calculateReadingTime.js";
import getAuthorsByName from "../helpers/getAuthorsByName.js";
import likeModel from "../databases/models/like.model.js";
import bookmarkModel from "../databases/models/bookmark.model.js";
import { redisClient } from "../server.js";

export const createBlogPost = async (
	title,
	body,
	tags = [],
	description = "",
	author
) => {
	if (!title || !body || !author) {
		throw new ErrorAndStatus("Title, body, and author are required", 400);
	}

	const blogPost = await blogModel.findOne({
		title: { $regex: new RegExp(`^${title}$`, "i") },
	});

	if (blogPost) {
		throw new ErrorAndStatus("Post title exist, title must be unique", 400);
	}

	const reading_time = await calculateReadingTime(body);

	try {
		const newPost = new blogModel({
			title,
			description,
			tags,
			body,
			reading_time,
			author,
		});

		await newPost.save();

		await newPost.populate({
			path: "author",
			select: "-password -__v -updatedAt -createdAt",
		});

		return newPost;
	} catch (error) {
		throw new ErrorAndStatus(error.message, error.status || 500);
	}
};

export const allPublishedBlogPost = async (
	page = 1,
	limit = 5,
	searchQuery = null,
	order = "",
	userId = null
) => {
	try {
		const skip = (page - 1) * limit;

		let filter = {
			state: "PUBLISHED",
		};

		if (searchQuery) {
			filter.$or = [
				{ title: { $regex: searchQuery, $options: "i" } },
				{ author: { $in: await getAuthorsByName(searchQuery) } },
				{ tags: { $regex: searchQuery, $options: "i" } },
			];
		}

		const sortOptions = {};

		switch (order) {
			case "newest":
				sortOptions.publishedAt = -1;
				break;
			case "oldest":
				sortOptions.timestamp = 1;
				break;
			case "read_count":
				sortOptions.read_count = -1;
				break;
			case "reading_time":
				sortOptions.reading_time = -1;
				break;
			default:
				sortOptions.publishedAt = -1;
				break;
		}
		let blogPosts;

		const cacheKey = `allPosts:${JSON.stringify(filter)}:${JSON.stringify(
			sortOptions
		)}:${searchQuery}:${page}:${limit}`;

		const cacheData = await redisClient.get(cacheKey);

		if (cacheData) {
			// console.log("returning data from cache");
			return JSON.parse(cacheData);
		}

		// console.log("returning data from database");
		blogPosts = await blogModel
			.find(filter, { __v: 0 })
			.sort(sortOptions)
			.skip(skip)
			.limit(limit)
			.populate({
				path: "author",
				select: "-password -__v -updatedAt -createdAt",
			})
			.lean();

		const total_items = await blogModel.countDocuments(filter);

		const last_page = Math.ceil(total_items / limit);

		const first_item = last_page > 0 ? skip + 1 : 0;

		blogPosts = await Promise.all(
			blogPosts.map(async (blogPost) => {
				const postLikes = await likeModel.find({ post: blogPost._id });
				const likeCount = postLikes.length;
				let isLiked = false;
				let isBookmarked = false;

				if (userId) {
					const userLikes = await likeModel.find({ user: userId });
					const userBookmarks = await bookmarkModel.find({ user: userId });
					const likePostId = new Set(
						userLikes.map((like) => like.post.toString())
					);
					const bookmarkePostId = new Set(
						userBookmarks.map((bookmark) => bookmark.post.toString())
					);
					isBookmarked = bookmarkePostId.has(blogPost._id.toString());
					isLiked = likePostId.has(blogPost._id.toString());
				}
				return { ...blogPost, likeCount, isLiked, isBookmarked };
			})
		);
		const result = {
			meta: {
				current_page: page,
				item_per_page: limit,
				total_items,
				last_page,
				first_item,
			},
			posts: blogPosts,
		};

		await redisClient.setEx(cacheKey, 10 * 60, JSON.stringify(result));

		return result;
	} catch (error) {
		throw new ErrorAndStatus(error.message, error.status || 500);
	}
};

export const authorBlogPosts = async ({
	authorId = null,
	userId = null,
	page = 1,
	limit = 5,
	search = "",
	order = "",
	state = "",
}) => {
	if (!authorId) {
		throw new ErrorAndStatus("user id is required", 401);
	}

	try {
		const skip = (page - 1) * limit;

		let filter = {
			author: authorId,
			state: "PUBLISHED",
		};

		if (userId === authorId) {
			filter.state = { $regex: state, $options: "i" };
		}

		if (search) {
			filter.$or = [
				{ title: { $regex: search, $options: "i" } },
				{ tags: { $regex: search, $options: "i" } },
			];
		}

		const sortOptions = {};

		switch (order) {
			case "newest":
				sortOptions.publishedAt = -1;
				break;
			case "oldest":
				sortOptions.timestamp = 1;
				break;
			case "read_count":
				sortOptions.read_count = -1;
				break;
			case "reading_time":
				sortOptions.reading_time = -1;
				break;
			default:
				sortOptions.publishedAt = -1;
				break;
		}

		const cacheKey = `authorPost:${JSON.stringify(filter)}:${JSON.stringify(
			sortOptions
		)}:${limit}:${page}`;

		const cacheData = await redisClient.get(cacheKey);

		if (cacheData) {
			return JSON.parse(cacheData);
		}

		let blogPosts = await blogModel
			.find(filter, { __v: 0 })
			.sort(sortOptions)
			.skip(skip)
			.limit(limit)
			.populate({
				path: "author",
				select: "-password -__v -updatedAt -createdAt",
			})
			.lean();

		const total_items = await blogModel.countDocuments(filter);

		const last_page = Math.ceil(total_items / limit);

		const first_item = last_page > 0 ? skip + 1 : 0;

		blogPosts = await Promise.all(
			blogPosts.map(async (blogPost) => {
				const postLikes = await likeModel.find({ post: blogPost._id });
				const likeCount = postLikes.length;
				let isLiked = false;
				let isBookmarked = false;

				if (userId) {
					const userLikes = await likeModel.find({ user: userId });
					const userBookmarks = await bookmarkModel.find({ user: userId });
					const likePostId = new Set(
						userLikes.map((like) => like.post.toString())
					);
					const bookmarkePostId = new Set(
						userBookmarks.map((bookmark) => bookmark.post.toString())
					);
					isBookmarked = bookmarkePostId.has(blogPost._id.toString());
					isLiked = likePostId.has(blogPost._id.toString());
				}
				return { ...blogPost, likeCount, isLiked, isBookmarked };
			})
		);

		const result = {
			meta: {
				current_page: page,
				item_per_page: limit,
				first_item,
				last_page,
				total_items,
			},
			posts: blogPosts,
		};

		await redisClient.setEx(cacheKey, 1 * 60, JSON.stringify(result));

		return result;
	} catch (error) {
		throw new ErrorAndStatus(error.message, error.status || 500);
	}
};

export const publishBlogPost = async (blogPostId, userId) => {
	if (!blogPostId) {
		throw new ErrorAndStatus("Post id is required!", 400);
	}

	if (!userId) {
		throw new ErrorAndStatus("User id is required!", 400);
	}
	try {
		const blogPost = await blogModel.findById(blogPostId);

		if (!blogPost) {
			throw new ErrorAndStatus("Post not found!", 404);
		}

		if (userId !== blogPost.author.toString()) {
			throw new ErrorAndStatus("Forbiden!", 403);
		}

		if (blogPost.state === "PUBLISHED") {
			throw new ErrorAndStatus("Post was published already", 400);
		}

		blogPost.state = "PUBLISHED";
		blogPost.publishedAt = new Date().toISOString();

		await blogPost.save();

		return blogPost;
	} catch (error) {
		throw new ErrorAndStatus(error.message, error.status || 500);
	}
};

export const singleBlogPost = async (postId, userId) => {
	if (!postId) {
		throw new ErrorAndStatus("Post id is required", 400);
	}

	try {
		const cacheKey = `singlePost:${postId}`;
		const cacheData = await redisClient.get(cacheKey);

		if (cacheData) {
			return JSON.parse(cacheData);
		}

		let blogPost = await blogModel.findById(postId, { __v: 0 }).populate({
			path: "author",
			select: "-password -__v -updatedAt -createdAt",
		});

		if (!blogPost) {
			throw new ErrorAndStatus("Post not found", 404);
		}

		if (blogPost.author._id.toString() !== userId) {
			blogPost.read_count += 1;
		}

		await blogPost.save();

		await redisClient.setEx(cacheKey, 5 * 60, JSON.stringify(blogPost));

		return blogPost;
	} catch (error) {
		throw new ErrorAndStatus(error.message, error.status || 500);
	}
};

export const updateBlogPost = async (postId, updatedBlogPost, userId) => {
	if (!postId) {
		throw new ErrorAndStatus("Post id param is required", 400);
	}

	const blogPost = await blogModel.findById(postId);

	if (!blogPost) {
		throw new ErrorAndStatus("Post not found", 404);
	}

	if (blogPost.author.toString() !== userId) {
		throw new ErrorAndStatus("Forbiden", 403);
	}

	if (
		updatedBlogPost.title &&
		blogPost.title.toLowerCase() !== updatedBlogPost.title.toLowerCase()
	) {
		const duplicatePostTitle = await blogModel.findOne({
			title: { $regex: new RegExp(`^${updatedBlogPost.title}$`, "i") },
		});

		if (duplicatePostTitle) {
			throw new ErrorAndStatus("Title exist, title must be unique", 404);
		}
	}

	const reading_time = await calculateReadingTime(updatedBlogPost.body);

	if (reading_time) {
		updatedBlogPost.reading_time = reading_time;
	}

	Object.assign(blogPost, updatedBlogPost);

	await blogPost.save();

	return blogPost.populate({ path: "author", select: "-password -__v" });
};

export const deleteBlogPost = async (postId, user) => {
	if (!postId) {
		throw new ErrorAndStatus("Post id param is required", 400);
	}

	const post = await blogModel.findById(postId);

	if (!post) {
		throw new ErrorAndStatus("Post not found!", 404);
	}

	if (post.author.toString() != user._id && user.role !== "ADMIN") {
		throw new ErrorAndStatus("Access forbidden", 403);
	}

	await blogModel.findByIdAndDelete(postId);

	return true;
};

export const allBlogPost = async (
	page = 1,
	limit = 5,
	searchQuery = null,
	order = "",
	state = null
) => {
	try {
		const skip = (page - 1) * limit;

		let filter = {};

		if (searchQuery) {
			filter.$or = [
				{ title: { $regex: searchQuery, $options: "i" } },
				{ author: { $in: await getAuthorsByName(searchQuery) } },
				{ tags: { $regex: searchQuery, $options: "i" } },
			];
		}

		if (state) {
			filter.state = { $regex: state, $options: "i" };
		}

		const sortOptions = {};

		switch (order) {
			case "newest":
				sortOptions.createdAt = -1;
				break;
			case "oldest":
				sortOptions.timestamp = 1;
				break;
			case "read_count":
				sortOptions.read_count = -1;
				break;
			case "reading_time":
				sortOptions.reading_time = -1;
				break;
			default:
				sortOptions.createdAt = -1;
				break;
		}

		const blogPosts = await blogModel
			.find(filter, { __v: 0 })
			.sort(sortOptions)
			.skip(skip)
			.limit(limit)
			.populate({
				path: "author",
				select: "-password",
			});
		const total_items = await blogModel.countDocuments(filter);

		const last_page = Math.ceil(total_items / limit);

		const first_item = last_page > 0 ? skip + 1 : 0;

		return {
			meta: {
				current_page: page,
				item_per_page: limit,
				total_items,
				last_page,
				first_item,
			},
			posts: blogPosts,
		};
	} catch (error) {
		throw new ErrorAndStatus(error.message, error.status || 500);
	}
};

export const featuredPost = async () => {
	try {
		const featured = await blogModel
			.find({ featured: true })
			.populate({ path: "author" });

		return featured;
	} catch (error) {
		throw new ErrorAndStatus(
			error.message || "An error occured, try again",
			error.status || 500
		);
	}
};
