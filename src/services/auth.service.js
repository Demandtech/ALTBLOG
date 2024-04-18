import UserModel from "../databases/models/user.model.js";
import { ErrorAndStatus } from "../exceptions/errorandstatus.js";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";

export const register = async (
	email,
	password,
	first_name,
	last_name,
	role
) => {
	try {
		const user = await UserModel.findOne({ email });

		if (user) {
			throw new ErrorAndStatus("User exist", 404);
		}

		if (!first_name || !last_name || !email || !password || !role) {
			throw new ErrorAndStatus("All fields are required", 404);
		}

		password = await bcrypt.hash(password, 10);

		let newUser = new UserModel({
			first_name,
			last_name,
			password,
			email,
			role,
		});

		await newUser.save();

		newUser = newUser.toObject();

		delete newUser.password;

		return newUser;
	} catch (error) {
		throw new ErrorAndStatus(error?.message, 500);
	}
};

export const login = async (email, password) => {
	if ((!email, !password)) {
		throw new ErrorAndStatus("All fields are required", 500);
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
			},
			jwtSec,
			{ expiresIn: "1hr" }
		);
		return {token, user};

	} catch (error) {
		throw new ErrorAndStatus(error?.message, 500);
	}
};
