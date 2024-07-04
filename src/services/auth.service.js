import UserModel from "../databases/models/user.model.js";
import { ErrorAndStatus } from "../exceptions/errorandstatus.js";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import generateJWT from "../helpers/generateToken.js";

export const register = async ({
	email,
	password,
	first_name,
	last_name,
	profession,
}) => {
	try {
		const user = await UserModel.findOne({ email });

		if (user) {
			throw new ErrorAndStatus(
				"Email already in use. Please use a different email.",
				404
			);
		}

		if (!first_name || !last_name || !email || !password || !profession) {
			throw new ErrorAndStatus("All fields are required", 404);
		}

		password = await bcrypt.hash(password, 10);

		let newUser = new UserModel({
			first_name,
			last_name,
			password,
			email,
			profession,
		});

		await newUser.save();

		newUser = newUser.toObject();

		delete newUser.password;

		return newUser;
	} catch (error) {
		throw new ErrorAndStatus(error?.message, error.status || 500);
	}
};

export const login = async (email, password) => {
	if (!email || !password) {
		throw new ErrorAndStatus("All fields are required", 400);
	}
	try {
		let user = await UserModel.findOne({ email });

		if (!user) {
			throw new ErrorAndStatus("Username or Password is incorrect", 401);
		}

		if (user.googleId)
			throw new ErrorAndStatus(
				"Email registered with google, please try to login with google!",
				401
			);

		if (user.linkedId)
			throw new ErrorAndStatus(
				"Email registered with linkedin, please try to login with linkedin!",
				401
			);

		const passwordMatch = await bcrypt.compare(password, user.password);
		
		if (!passwordMatch) {
			throw new ErrorAndStatus("Username or Password is incorrect", 401);
		}

		const jwtSec = process.env.JWT_SECRET || "secret";

		const token = generateJWT(user, jwtSec);

		return { token, message: `Welcome back ${user.first_name}!` };
	} catch (error) {
		throw new ErrorAndStatus(error?.message, error.status || 500);
	}
};

export const changePassword = async ({
	currentPassword,
	newPassword,
	userId,
}) => {
	if (!userId || !newPassword || !currentPassword)
		throw new ErrorAndStatus("Check required data", 400);

	try {
		const user = await UserModel.findById(userId);

		if (!user) throw new ErrorAndStatus("user not found", 404);

		const isPasswordMatch = await bcrypt.compare(
			currentPassword,
			user.password
		);
		const isTheSamePassword = await bcrypt.compare(newPassword, user.password);
		if (!isPasswordMatch)
			throw new ErrorAndStatus("current password is incorrect", 400);

		if (isTheSamePassword)
			throw new ErrorAndStatus(
				"use a different password, from your old password",
				400
			);

		const password = await bcrypt.hash(newPassword, 10);

		user.password = password;
		await user.save();

		return { message: "Password changed successfully" };
	} catch (error) {
		throw new ErrorAndStatus(
			error.message || "Internal server error",
			error.status || 500
		);
	}
};
