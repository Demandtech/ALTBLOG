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
		throw new ErrorAndStatus(error.message, 500);
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
			data: blogPosts,
		};
	} catch (error) {
		throw new ErrorAndStatus(error.message, 500);
	}
};

export const ownerBlogPosts = async (
	userId,
	page = 1,
	limit = 5,
	searchQuery = null
) => {
	if (!userId) {
		throw new ErrorAndStatus("id is required", 401);
	}

	try {
		const skip = (page - 1) * limit;

		// const filter = searchQuery
		// 	? {
		// 			state: { $regex: searchQuery, $options: "i" },
		// 	  }
		// 	: {};

		let filter = {
			author: userId,
		};

		if (searchQuery) {
			filter.state = { $regex: searchQuery, $options: "i" };
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
				total_items
			},
			data: blogPosts,
		};
	} catch (error) {
		throw new ErrorAndStatus(error.message, 500);
	}
};
