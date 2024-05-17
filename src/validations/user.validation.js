import Joi from "joi";

export const updateUserPhotoSchema = Joi.object({
	avatar: Joi.any(),
	banner_image: Joi.any(),
});

export const updateUserDetailsSchema = Joi.object({
	first_name: Joi.string().required(),
	last_name: Joi.string().required(),
	email: Joi.string().email().required(),
	profession: Joi.string().required(),
	dob: Joi.string(),
	phone: Joi.string(),
	country: Joi.object(),
	sex: Joi.string().valid("MALE", "FEMALE"),
	facebook: Joi.string(),
	twitter: Joi.string(),
	linkedin: Joi.string(),
	telegram: Joi.string(),
	medium: Joi.string(),
	pinterest: Joi.string(),
});
