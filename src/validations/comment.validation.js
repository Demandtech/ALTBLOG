import Joi from "joi";


export const commentValidation = Joi.object({
	postId: Joi.string().required(),
	userId: Joi.string().required(),
	text: Joi.string().required(),
});
