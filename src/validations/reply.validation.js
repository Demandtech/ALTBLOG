import Joi from "joi";

const replyValidation = Joi.object({
	commentId: Joi.string().required(),
	userId: Joi.string().required(),
	text: Joi.string().required(),
});

export default replyValidation