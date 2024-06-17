import Joi from "joi";


export const commentValidation = Joi.object({
	postId: Joi.string().required(),
	userId: Joi.string().required(),
	text: Joi.string().required(),
});

export const replyCommentValidation = Joi.object({
	commentId: Joi.string().required(),
	userId: Joi.string().required(),
	text: Joi.string().required(),
})