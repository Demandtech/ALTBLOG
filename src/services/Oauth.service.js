import config from "../configs/google.js";
import { ErrorAndStatus } from "../exceptions/errorandstatus.js";
import queryString from "query-string";
import jwt from "jsonwebtoken";
import UserModel from "../databases/models/user.model.js";
import generateJWT from "../helpers/generateToken.js";

const googleAuthParams = queryString.stringify({
	client_id: config.clientId,
	redirect_uri: config.redirectUrl,
	response_type: "code",
	scope: "openid profile email",
	access_type: "offline",
	state: "standard_oauth",
	prompt: "consent",
});

const getGoogleTokenParams = (code) => {
	return queryString.stringify({
		client_id: config.clientId,
		client_secret: config.clientSecret,
		code,
		grant_type: "authorization_code",
		redirect_uri: config.redirectUrl,
	});
};

export const googleUrl = () => {
	return `${config.authUrl}?${googleAuthParams}`;
};

export const getGoogleToken = async (code) => {
	if (!code)
		throw new ErrorAndStatus("Authorization code must be provided", 400);
	try {
		const googleTokenParam = getGoogleTokenParams(code);

		const response = await fetch(`${config.tokenUrl}?${googleTokenParam}`, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: googleTokenParam,
		});
		if (!response.ok) throw new ErrorAndStatus("Auth error", 400);

		const data = await response.json();

		const { id_token } = data;
		if (!id_token) throw new ErrorAndStatus("Auth error", 400);
		const { email, family_name, picture, given_name, sub } =
			jwt.decode(id_token);

		const existingUser = await UserModel.findOne({ email });

		if (existingUser) {
			if (existingUser.googleId) {
				const token = generateJWT(existingUser, config.tokenSecret);

				return { token, message: `Welcome back, ${existingUser.first_name}!` };
			} else {
				existingUser.googleId = sub;
				existingUser.save();

				existingUser.toObject();

				delete existingUser.password;

				const token = generateJWT(existingUser, config.tokenSecret);

				return {
					token,
					message: `Account linked successfully, ${existingUser.first_name}!`,
				};
			}
		}

		let newUser = new UserModel({
			first_name: given_name,
			last_name: family_name,
			email,
			googleId: sub,
			avatar: picture,
		});

		await newUser.save();

		const token = generateJWT(newUser, config.tokenSecret);

		return {
			token,
			message: `Registration successfuly, welcome ${newUser.first_name}!`,
		};
	} catch (err) {
		console.error("Error fetching Google token:", err);
		throw new ErrorAndStatus(
			err.message || "Internal server error",
			err.status || 500
		);
	}
};
