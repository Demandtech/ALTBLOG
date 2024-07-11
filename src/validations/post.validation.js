import Joi from "joi";

export const createPostSchema = Joi.object({
	title: Joi.string().required(),
	body: Joi.string().required(),
	category: Joi.string().required(),
	tags: Joi.array().items(Joi.string().max(255)).max(5).required(),
	description: Joi.string().required(),
});

export const updatePostSchema = Joi.object({
	title: Joi.string().required(),
	body: Joi.string().required(),
	category: Joi.string().required(),
	tags: Joi.array().required(),
	description: Joi.string().required(),
});
