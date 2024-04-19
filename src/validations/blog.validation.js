import Joi from "joi";

export const createBlogPostSchema = Joi.object({
	title: Joi.string().required(),
	body: Joi.string().required(),
	state: Joi.string().valid("DRAFT", "PUBLISHED").required(),
	tags: Joi.array(),
	description: Joi.string(),
});
