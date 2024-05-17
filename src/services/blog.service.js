import blogModel from "../databases/models/blog.model.js";
import { ErrorAndStatus } from "../exceptions/errorandstatus.js";
import calculateReadingTime from "../helpers/calculateReadingTime.js";
import getAuthorsByName from "../helpers/getAuthorsByName.js";

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
	order = ""
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

		const blogPosts = await blogModel
			.find(filter, { __v: 0 })
			.sort(sortOptions)
			.skip(skip)
			.limit(limit)
			.populate({
				path: "author",
				select: "-password -__v -updatedAt -createdAt",
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

		const total_items = await blogModel.countDocuments(filter);

		const last_page = Math.ceil(total_items / limit);

		const blogPosts = await blogModel
			.find(filter, { __v: 0 })
			.sort(sortOptions)
			.skip(skip)
			.limit(limit)
			.populate({
				path: "author",
				select: "-password -__v -updatedAt -createdAt",
			});

		const first_item = last_page > 0 ? skip + 1 : 0;

		return {
			meta: {
				current_page: page,
				item_per_page: limit,
				first_item,
				last_page,
				total_items,
			},
			posts: blogPosts,
		};
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
		const blogPost = await blogModel.findById(postId, { __v: 0 }).populate({
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

		return blogPost;
	} catch (error) {
		throw new ErrorAndStatus(error.message, error.status || 500);
	}
};

export const allPersonalBlogPosts = async (
	userId,
	page = 1,
	limit = 5,
	state = null,
	order = ""
) => {
	if (!userId) {
		throw new ErrorAndStatus("user id is required", 401);
	}

	const sortOptions = {};

	switch (order) {
		case "newest":
			if (state && state.toUpperCase() === "DRAFT") {
				sortOptions.createdAt = -1;
			}
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
			sortOptions.createdAt = -1;
			break;
	}

	try {
		const skip = (page - 1) * limit;

		let filter = {
			author: userId,
		};

		if (state) {
			filter.state = { $regex: state, $options: "i" };
		}

		const total_items = await blogModel.countDocuments(filter);

		const last_page = Math.ceil(total_items / limit);

		const blogPosts = await blogModel
			.find(filter, { __v: 0 })
			.sort(sortOptions)
			.skip(skip)
			.limit(limit)
			.populate({
				path: "author",
				select: "-password -__v -updatedAt -createdAt",
			});

		const first_item = last_page > 0 ? skip + 1 : 0;

		return {
			meta: {
				current_page: page,
				item_per_page: limit,
				first_item,
				last_page,
				total_items,
			},
			posts: blogPosts,
		};
	} catch (error) {
		throw new ErrorAndStatus(error.message, error.status || 500);
	}
};

export const updateBlogPost = async (postId, updatedBlogPost, userId) => {
	if (!postId) {
		throw new ErrorAndStatus("Post id param is required", 400);
	}

	console.log(updateBlogPost);

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
