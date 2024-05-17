import Joi from "joi";

export const registerSchema = Joi.object({
	first_name: Joi.string().required(),
	last_name: Joi.string().required(),
	email: Joi.string().email().required(),
	password: Joi.string().min(6).required(),
	profession: Joi.string().required(),
});

export const loginSchema = Joi.object({
	email: Joi.string().email().required(),
	password: Joi.string().min(6).required(),
});
