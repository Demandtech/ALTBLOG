import Joi from "joi";

export const registerSchema = Joi.object({
	first_name: Joi.string().required(),
	last_name: Joi.string().required(),
	email: Joi.string().email().required(),
	password: Joi.string().min(6).required(),
	role: Joi.string().valid("USER", "ADMIN"),
});

export const loginSchema = Joi.object({
	email: Joi.string().email().required(),
	password: Joi.string().min(6).required(),
});
