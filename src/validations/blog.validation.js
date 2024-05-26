import Joi from "joi";

export const createBlogPostSchema = Joi.object({
	title: Joi.string().required(),
	body: Joi.string().required(),
	category: Joi.string().required(),
	tags: Joi.array().items(Joi.string().max(255)).max(5).required(),

	description: Joi.string(),
});

export const updateBlogPostSchema = Joi.object({
	title: Joi.string(),
	body: Joi.string(),
	category: Joi.string(),
	tags: Joi.array(),
	description: Joi.string(),
});
