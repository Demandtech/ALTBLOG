import Joi from "joi";

export const blogPostSchema = Joi.object({
	title: Joi.string().required(),
	body: Joi.string().required(),
	tags: Joi.array(),
	description: Joi.string(),
});