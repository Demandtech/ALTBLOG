import UserModel from "../databases/models/user.model.js";
import { ErrorAndStatus } from "../exceptions/errorandstatus.js";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";

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
	if ((!email, !password)) {
		throw new ErrorAndStatus("All fields are required", 401);
	}
	try {
		let user = await UserModel.findOne({ email });

		if (!user) {
			throw new ErrorAndStatus("Username or Password is incorrect", 401);
		}

		if (!(await bcrypt.compare(password, user.password))) {
			throw new ErrorAndStatus("Username or Password is incorrect", 401);
		}

		const jwtSec = process.env.JWT_SECRET || "secret";

		const token = Jwt.sign(
			{
				role: user?.role || "USER",
				email: user.email,
				_id: user._id,
				sub: user._id,
				name: user.first_name,
			},
			jwtSec,
			{ expiresIn: "30d" }
		);
		user = user.toObject();

		delete user.password;
		delete user.__v;

		return { token };
	} catch (error) {
		throw new ErrorAndStatus(error?.message, error.status || 500);
	}
};
