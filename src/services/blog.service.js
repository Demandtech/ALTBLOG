import blogModel from "../databases/models/blog.model.js";
import { ErrorAndStatus } from "../exceptions/errorandstatus.js";
import calculateReadingTime from "../helpers/calculateReadingTime.js";
import getAuthorsByName from "../helpers/getAuthorsByName.js";

export const createBlogPost = async (
	title,
	body,
	tags = [],
	state = "DRAFT",
	description = "",
	author
) => {
	if (!title || !body || !author) {
		throw new ErrorAndStatus("Title, body, and author are required", 400);
	}

	const blogPost = await blogModel.findOne({ title });

	if (blogPost) {
		throw new ErrorAndStatus("Post title exist, title must be unique", 400);
	}

	const reading_time = await calculateReadingTime(body);

	try {
		const newPost = new blogModel({
			title,
			description,
			tags,
			state,
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
		console.log(error.message);
		throw new ErrorAndStatus(error.message, error.status || 500);
	}
};

export const allBlogPost = async (page = 1, limit = 5, searchQuery = null) => {
	try {
		const skip = (page - 1) * limit;
		const filter = searchQuery
			? {
					$or: [
						{ title: { $regex: searchQuery, $options: "i" } },
						{ author: { $in: await getAuthorsByName(searchQuery) } },
						{ tags: { $regex: searchQuery, $options: "i" } },
					],
			  }
			: {};
		const blogPosts = await blogModel
			.find(filter, { __v: 0 })
			.skip(skip)
			.limit(limit)
			.populate({
				path: "author",
				select: "-password -__v -updatedAt -createdAt",
			});
		const total_items = await blogModel.countDocuments(filter);

		const last_page = Math.ceil(total_items / limit);

		const first_item = skip + 1;

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

export const ownerBlogPosts = async (
	userId,
	page = 1,
	limit = 5,
	state = null
) => {
	if (!userId) {
		throw new ErrorAndStatus("user id is required", 401);
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
			.skip(skip)
			.limit(limit)
			.populate({
				path: "author",
				select: "-password -__v -updatedAt -createdAt",
			});

		const first_item = skip + 1;

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

export const updatePostState = async (blogPostId, userId) => {
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

		if (userId != blogPost.author) {
			throw new ErrorAndStatus("Forbiden!", 403);
		}

		if (blogPost.state === "PUBLISHED") {
			throw new ErrorAndStatus("Post was published already", 400);
		}

		blogPost.state = "PUBLISHED";

		await blogPost.save();

		return blogPost;
	} catch (error) {
		throw new ErrorAndStatus(error.message, error.status || 500);
	}
};
