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
			required: true,
			trim: true,
		},
		role: {
			type: String,
			enum: ["USER", "ADMIN"],
			default: "USER",
		},
	},
	{ timestamps: true }
);

export default userSchema;
