import Joi from "joi";

export const createBlogPostSchema = Joi.object({
	title: Joi.string().required(),
	body: Joi.string().required(),
	tags: Joi.array(),
	description: Joi.string(),
});

export const updateBlogPostSchema = Joi.object({
	title: Joi.string(),
	body: Joi.string(),
	tags: Joi.array(),
	description: Joi.string(),
});