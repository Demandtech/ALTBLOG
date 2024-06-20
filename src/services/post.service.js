import postModel from "../databases/models/post.model.js";
import { ErrorAndStatus } from "../exceptions/errorandstatus.js";
import calculateReadingTime from "../helpers/calculateReadingTime.js";
import getAuthorsByName from "../helpers/getAuthorsByName.js";
import { postLikeModel } from "../databases/models/like.model.js";
import bookmarkModel from "../databases/models/bookmark.model.js";
import { redisClient } from "../server.js";
import commentModel from "../databases/models/comment.model.js";
import viewModel from "../databases/models/view.model.js";

// import { postLikeSchema } from "../databases/schemas/like.schema.js";
// import bookmarkSchema from "../databases/schemas/bookmark.schema.js";
// import commentSchema from "../databases/schemas/comment.schema.js";

export const createPost = async ({
	title,
	body,
	tags = [],
	description = "",
	author,
	category,
}) => {
	if (!title || !body || !author) {
		throw new ErrorAndStatus("Title, body, and author are required", 400);
	}

	const post = await postModel.findOne({
		title: { $regex: new RegExp(`^${title}$`, "i") },
	});

	if (post) {
		throw new ErrorAndStatus("Post title exist, title must be unique", 409);
	}

	const reading_time = await calculateReadingTime(body);

	try {
		const newPost = new postModel({
			title,
			description,
			tags,
			body,
			reading_time,
			author,
			category,
		});

		await newPost.save();

		await newPost.populate({
			path: "author",
			select: "-password -__v -updatedAt -createdAt",
		});

		newPost.toObject();
		newPost.read_count = 0;

		return newPost;
	} catch (error) {
		throw new ErrorAndStatus(error.message, error.status || 500);
	}
};

export const allPublishedPost = async ({
	page = 1,
	limit = 5,
	searchQuery = null,
	category = null,
	order = "",
	userId = null,
}) => {
	try {
		const skip = (page - 1) * limit;

		let filter = {
			state: "PUBLISHED",
		};

		if (category) {
			filter.category = category;
		}

		if (searchQuery) {
			filter.$or = [
				{ title: { $regex: searchQuery, $options: "i" } },
				{ author: { $in: await getAuthorsByName(searchQuery) } },
				{ tags: { $regex: searchQuery, $options: "i" } },
				{ category: { $regex: searchQuery, $options: "i" } },
			];
		}

		const sortOptions = {};

		switch (order) {
			case "newest":
				sortOptions.publishedAt = -1;
				break;
			case "oldest":
				sortOptions.timestamps = 1;
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
		// let blogPosts;

		// const cacheKey = `allPosts:${JSON.stringify(filter)}:${JSON.stringify(
		// 	sortOptions
		// )}:${searchQuery}:${page}:${limit}`;

		// const cacheData = await redisClient.get(cacheKey);

		// if (cacheData) {

		// 	return JSON.parse(cacheData);
		// }

		// console.log("returning data from database");
		let posts = await postModel
			.find(filter, { __v: 0 })
			.sort(sortOptions)
			.skip(skip)
			.limit(limit)
			.populate({
				path: "author",
				select: "-password -__v -updatedAt -createdAt",
			})
			.lean();

		const total_items = await postModel.countDocuments(filter);

		const last_page = Math.ceil(total_items / limit);

		const first_item = last_page > 0 ? skip + 1 : 0;

		posts = await Promise.all(
			posts.map(async (post) => {
				const postLikes = await postLikeModel.find({ post: post._id });
				const postComments = await commentModel.find({ post: post._id });
				const likeCount = postLikes.length || 0;
				const commentCount = postComments.length || 0;
				const read_count = await viewModel.countDocuments({ postId: post._id });
				let isLiked = false;
				let isBookmarked = false;

				if (userId) {
					const userLikes = await postLikeModel.find({ user: userId });
					const userBookmarks = await bookmarkModel.find({ user: userId });
					const likePostId = new Set(
						userLikes.map((like) => like.post.toString())
					);
					const bookmarkePostId = new Set(
						userBookmarks.map((bookmark) => bookmark.post.toString())
					);
					isBookmarked = bookmarkePostId.has(post._id.toString());
					isLiked = likePostId.has(post._id.toString());
				}
				return {
					...post,
					likeCount,
					commentCount,
					isLiked,
					isBookmarked,
					read_count,
				};
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
			posts,
		};

		// await redisClient.setEx(cacheKey, 2 * 60, JSON.stringify(result));

		return result;
	} catch (error) {
		throw new ErrorAndStatus(error.message, error.status || 500);
	}
};

export const authorPosts = async ({
	authorId = null,
	userId = null,
	page = 1,
	limit = 5,
	search = "",
	order = "",
	state = "",
	category = null,
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

		if (category) {
			filter.category = category;
		}

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

		// const cacheKey = `authorPost:${JSON.stringify(filter)}:${JSON.stringify(
		// 	sortOptions
		// )}:${limit}:${page}:${authorId}`;

		// const cacheData = await redisClient.get(cacheKey);

		// if (cacheData) {
		// 	return JSON.parse(cacheData);
		// }

		let posts = await postModel
			.find(filter, { __v: 0 })
			.sort(sortOptions)
			.skip(skip)
			.limit(limit)
			.populate({
				path: "author",
				select: "-password -__v -updatedAt -createdAt",
			})
			.lean();

		const total_items = await postModel.countDocuments(filter);

		const last_page = Math.ceil(total_items / limit);

		const first_item = last_page > 0 ? skip + 1 : 0;

		posts = await Promise.all(
			posts.map(async (post) => {
				const postLikes = await postLikeModel.find({ post: post._id });
				const postComments = await commentModel.find({ post: post._id });
				const likeCount = postLikes.length;
				const commentCount = postComments.length;
				const read_count = await viewModel.countDocuments({ postId: post._id });
				let isLiked = false;
				let isBookmarked = false;

				if (userId) {
					const userLikes = await postLikeModel.find({ user: userId });
					const userBookmarks = await postLikeModel.find({ user: userId });
					const likePostId = new Set(
						userLikes.map((like) => like.post.toString())
					);
					const bookmarkePostId = new Set(
						userBookmarks.map((bookmark) => bookmark.post.toString())
					);
					isBookmarked = bookmarkePostId.has(post._id.toString());
					isLiked = likePostId.has(post._id.toString());
				}
				return {
					...post,
					likeCount,
					commentCount,
					isLiked,
					isBookmarked,
					read_count,
				};
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
			posts: posts,
		};

		// await redisClient.setEx(cacheKey, 1 * 60, JSON.stringify(result));

		return result;
	} catch (error) {
		throw new ErrorAndStatus(error.message, error.status || 500);
	}
};

export const singlePost = async ({ postId, userId, userIp }) => {
	if (!postId) {
		throw new ErrorAndStatus("Post id is required", 400);
	}

	try {
		// const cacheKey = `singlePost:${postId}`;
		// const cacheData = await redisClient.get(cacheKey);

		// if (cacheData) {
		// 	return JSON.parse(cacheData);
		// }

		let post = await postModel.findById(postId, { __v: 0 }).populate({
			path: "author",
			select: "-password -__v -updatedAt -createdAt",
		});

		if (!post) {
			throw new ErrorAndStatus("Post not found", 404);
		}
		let read_count = await viewModel.countDocuments({ postId });

		if (post.author._id.toString() !== userId && post.state === "PUBLISHED") {
			const alreadyView = await viewModel.findOne({ userIp, postId });

			if (!alreadyView) {
				await viewModel.create({ userIp, postId, view: read_count + 1 });
				read_count += 1;
			}
		}

		const [postLikes, postComments] = await Promise.all([
			postLikeModel.find({ post: post._id }).lean(),
			commentModel.find({ post: post._id }).lean(),
		]);

		const likeCount = postLikes.length || 0;
		const commentCount = postComments.length || 0;
		let isLiked = false;
		let isBookmarked = false;

		if (userId) {
			const [userLikes, userBookmarks] = await Promise.all([
				postLikeModel.find({ user: userId }).lean(),
				bookmarkModel.find({ user: userId }).lean(),
			]);
			const likePostId = new Set(userLikes.map((like) => like.post.toString()));
			const bookmarkePostId = new Set(
				userBookmarks.map((bookmark) => bookmark.post.toString())
			);
			isBookmarked = bookmarkePostId.has(post._id.toString());
			isLiked = likePostId.has(post._id.toString());
		}

		const singPost = post.toObject();

		const response = {
			...singPost,
			read_count,
			likeCount,
			isLiked,
			isBookmarked,
			commentCount,
		};

		// await redisClient.setEx(cacheKey, 1 * 60, JSON.stringify(response));

		return response;
	} catch (error) {
		throw new ErrorAndStatus(error.message, error.status || 500);
	}
};

export const featuredPost = async () => {
	try {
		let featured = await postModel
			.find({ featured: true })
			.populate({
				path: "author",
				select: "-password -__v -updatedAt -createdAt",
			})
			.lean();
		featured = await Promise.all(
			featured.map(async (post) => {
				const read_count = await viewModel.countDocuments({ postId: post._id });
				return { ...post, read_count };
			})
		);

		return featured;
	} catch (error) {
		throw new ErrorAndStatus(
			error.message || "An error occured, try again later!",
			error.status || 500
		);
	}
};

export const relatedPosts = async ({ postId, page, search, userId = null }) => {
	if (!postId) {
		throw new ErrorAndStatus("Post id is required", 400);
	}

	const limit = 4;
	const skip = (page - 1) * limit;

	try {
		const post = await postModel.findById(postId);

		const filters = {
			_id: { $ne: postId },
			$or: [
				{ category: { $regex: new RegExp(post.category, "i") } },
				{ tags: { $in: post.tags } },
			],
		};

		// const cacheKey = `relatedPost:${postId}:${page}:${search}:${JSON.stringify(
		// 	filters
		// )}`;
		// const cacheData = await redisClient.get(cacheKey);

		// if (cacheData) {
		// 	return JSON.parse(cacheData);
		// }

		if (!post) {
			throw new ErrorAndStatus("Post not found", 404);
		}

		if (search) {
			filters.$or = [
				{ title: { $regex: search, $options: "i" } },
				{ author: { $in: await getAuthorsByName(search) } },
				{ tags: { $regex: search, $options: "i" } },
				{ category: { $regex: search, $options: "i" } },
			];
		}

		let posts = await postModel
			.find(filters)
			.skip(skip)
			.limit(limit + 1)
			.populate({
				path: "author",
				select: "-password -__v -updatedAt -createdAt",
			})
			.lean();

		posts = await Promise.all(
			posts.map(async (post) => {
				const postLikes = await postLikeModel.find({ post: post._id });
				const postComments = await commentModel.find({ post: post._id });
				const likeCount = postLikes.length;
				const commentCount = postComments.length;
				let isLiked = false;
				let isBookmarked = false;

				if (userId) {
					const userLikes = await postLikeModel.find({ user: userId });
					const userBookmarks = await postLikeModel.find({ user: userId });
					const likePostId = new Set(
						userLikes.map((like) => like.post.toString())
					);
					const bookmarkePostId = new Set(
						userBookmarks.map((bookmark) => bookmark.post.toString())
					);
					isBookmarked = bookmarkePostId.has(post._id.toString());
					isLiked = likePostId.has(post._id.toString());
				}
				return { ...post, likeCount, commentCount, isLiked, isBookmarked };
			})
		);

		const hasMore = posts.length > limit;

		const response = hasMore ? posts.slice(0, limit) : posts;

		const result = { hasMore, relatedPosts: response };

		// if (result.relatedPosts.length > 0) {
		// 	await redisClient.setEx(cacheKey, 5 * 60, JSON.stringify(result));
		// }

		return result;
	} catch (error) {
		throw new ErrorAndStatus(
			error.message || "An error occured, try again later!",
			error.status || 500
		);
	}
};

export const publishPost = async (postId, userId) => {
	if (!postId) {
		throw new ErrorAndStatus("Post id is required!", 400);
	}

	if (!userId) {
		throw new ErrorAndStatus("User id is required!", 400);
	}
	try {
		const post = await postModel.findById(postId);

		if (!post) {
			throw new ErrorAndStatus("Post not found!", 404);
		}

		if (userId !== post.author.toString()) {
			throw new ErrorAndStatus("Forbiden!", 403);
		}

		if (post.state === "PUBLISHED") {
			throw new ErrorAndStatus("Post was published already", 400);
		}

		post.state = "PUBLISHED";
		post.publishedAt = new Date().toISOString();

		await post.save();

		return post;
	} catch (error) {
		throw new ErrorAndStatus(error.message, error.status || 500);
	}
};

export const updatePost = async (postId, updatedPost, userId) => {
	if (!postId) {
		throw new ErrorAndStatus("Post id param is required", 400);
	}

	const post = await postModel.findById(postId);

	if (!post) {
		throw new ErrorAndStatus("Post not found", 404);
	}

	if (post.author.toString() !== userId) {
		throw new ErrorAndStatus("Forbiden", 403);
	}

	if (
		updatedPost.title &&
		post.title.toLowerCase() !== updatedPost.title.toLowerCase()
	) {
		const duplicatePostTitle = await postModel.findOne({
			title: { $regex: new RegExp(`^${updatedPost.title}$`, "i") },
		});

		if (duplicatePostTitle) {
			throw new ErrorAndStatus("Title exist, title must be unique", 404);
		}
	}

	const reading_time = await calculateReadingTime(updatedPost.body);

	if (reading_time) {
		updatedPost.reading_time = reading_time;
	}

	Object.assign(post, updatedPost);

	await post.save();

	console.log(userId);

	const singlePostCache = `singlePost:${postId}`;
	const authorCacheKey = `allPosts:{"author":{"$in":[${userId}]}}`;

	await Promise.all([
		redisClient.del(authorCacheKey),
		redisClient.del(singlePostCache),
	]);

	return post.populate({ path: "author", select: "-password -__v" });
};

export const deletePost = async (postId, user) => {
	try {
		if (!postId) {
			throw new ErrorAndStatus("Post id param is required", 400);
		}

		const post = await postModel.findById(postId);

		if (!post) {
			throw new ErrorAndStatus("Post not found!", 404);
		}

		if (post.author.toString() != user._id && user.role !== "ADMIN") {
			throw new ErrorAndStatus("Access forbidden", 403);
		}

		await postModel.findByIdAndDelete(postId);

		await postLikeModel.deleteMany({ post: postId });
		await commentModel.deleteMany({ post: postId });
		await bookmarkModel.deleteMany({ post: postId });

		return true;
	} catch (error) {
		throw new ErrorAndStatus(error.message, error.status || 500);
	}
};

export const allPosts = async (
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

		let posts = await postModel
			.find(filter, { __v: 0 })
			.sort(sortOptions)
			.skip(skip)
			.limit(limit)
			.populate({
				path: "author",
				select: "-password",
			})
			.lean();

		const total_items = await postModel.countDocuments(filter);

		const last_page = Math.ceil(total_items / limit);

		const first_item = last_page > 0 ? skip + 1 : 0;

		posts = await Promise.all(
			posts.map(async (post) => {
				const read_count = await viewModel.countDocuments({ postId: post._id });
				return { ...post, read_count };
			})
		);

		return {
			meta: {
				current_page: page,
				item_per_page: limit,
				total_items,
				last_page,
				first_item,
			},
			posts: posts,
		};
	} catch (error) {
		throw new ErrorAndStatus(error.message, error.status || 500);
	}
};
