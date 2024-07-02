import mongoose from "mongoose";

const userSchema = mongoose.Schema(
	{
		first_name: {
			type: String,
			required: true,
			trim: true,
		},
		last_name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			unique: true,
			required: true,
			lowercase: true,
		},
		password: {
			type: String,
			// required: true,
			trim: true,
		},
		role: {
			type: String,
			enum: ["USER", "ADMIN"],
			default: "USER",
		},
		profession: {
			type: String,
			// required: true,
			trim: true,
		},
		dob: {
			type: String,
			trim: true,
		},
		sex: {
			type: String,
			enum: ["MALE", "FEMALE"],
		},
		phone: {
			type: String,
			trim: true,
		},
		theme: {
			type: Boolean,
			default: false,
		},
		country: {
			type: Object,
		},
		banner_image: {
			type: String,
			default:
				"https://www.beautylabinternational.com/wp-content/uploads/2020/03/Hero-Banner-Placeholder-Light-1024x480-1.png",
		},
		avatar: {
			type: String,
		},
		facebook: {
			type: String,
		},
		telegram: {
			type: String,
		},
		twitter: {
			type: String,
		},
		pinterest: {
			type: String,
		},
		medium: {
			type: String,
		},
		linkedin: {
			type: String,
		},
		googleId: {
			type: String,
			unique: true,
		},
		linkedinId: {
			type: String,
			unique: true,
		},
	},
	{ timestamps: true }
);

export default userSchema;
