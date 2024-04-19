import blogModel from "../databases/models/blog.model.js";
import { ErrorAndStatus } from "../exceptions/errorandstatus.js";

export const createBlogPost = async (
	title,
	body,
	tags = [],
	state = "DRAFT",
	description = ""
) => {
	const author = "66211ff0e4d96e49b7e09bd2";
	const read_count = 10;
	const reading_time = "20 minutes";

	if (!title || !body || !author) {
		throw new ErrorAndStatus("Title, body, and author are required", 400);
	}

	const blogPost = await blogModel.findOne({ title });

	if (blogPost) {
		throw new ErrorAndStatus("Post title exist, title must be unique", 400);
	}

	try {
		console.log({
			title,
			description,
			tags,
			author,
			state,
			body,
			read_count,
			reading_time,
		});
		const newPost = new blogModel({
			title,
			description,
			tags,
			author,
			state,
			body,
			read_count,
			reading_time,
		});

		await newPost.save();

		return newPost;
	} catch (error) {
		throw new ErrorAndStatus(error.message, 500);
	}
};
