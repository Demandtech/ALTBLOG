import {
	user,
	updateUser,
	updateUserPhotos,
	authUser,
} from "../services/user.service.js";
import Jwt from "jsonwebtoken";
import path from "path";

export const handleUser = async (req, res) => {
	const authorization = req.headers.authorization;
	const id = req.params.id;

	if (!id) {
		return res.status(400).json({ message: "user id is required" });
	}
	try {
		let authId;
		if (authorization) {
			const [bearer, token] = authorization.split(" ");

			const jwtsec = process.env.JWT_SECRET;

			const decoded = Jwt.verify(token, jwtsec);

			authId = decoded._id;
		}

		const singleUser = await user(id, authId);

		return res.json({ message: "Single User", data: singleUser });
	} catch (error) {
		if (
			error.name === "JsonWebTokenError" ||
			error.name === "TokenExpiredError"
		) {
			return res.status(401).json({ message: "Unauthorized access" });
		}
		return res
			.status(error.status || 500)
			.json({ message: error.message || "Internal server error!" });
	}
};

export const handleUpdateUser = async (req, res) => {
	const id = req.user._id;
	const {
		first_name,
		last_name,
		profession,
		dob,
		country,
		sex,
		email,
		phone,
		facebook,
		twitter,
		telegram,
		medium,
		pinterest,
		linkedin,
	} = req.body;

	try {
		const updatedUser = await updateUser(id, {
			first_name,
			last_name,
			profession,
			dob,
			country,
			sex,
			email,
			phone,
			linkedin,
			facebook,
			pinterest,
			telegram,
			twitter,
			medium,
		});

		return res.json({
			message: "Profile updated successfully!",
			user: updatedUser,
		});
	} catch (error) {
		res.status(error.status || 500).json({
			message:
				error.message || "Internal server error, please try again later!",
		});
	}
};

export const handleUpdateUserPhotos = async (req, res) => {
	try {
		console.log(req.files);
		const { avatar, banner_image } = req.files || {};
		// const avatarPath = req?.files["avatar"][0]?.path;
		// const bannerImagePath = req?.files["banner_image"][0]?.path;
		let avatarPath;
		if (avatar) {
			avatarPath = avatar.length > 0 ? avatar[0].path : null;
		}
		let bannerImagePath;
		if (banner_image) {
			bannerImagePath = banner_image.length > 0 ? banner_image[0].path : null;
		}

		const userId = req.user._id;

		const avatarUrl = avatarPath
			? `${req.protocol}://${req.get("host")}/uploads/avatars/${path.basename(
					avatarPath
			  )}`
			: null;
		const bannerUrl = bannerImagePath
			? `${req.protocol}://${req.get(
					"host"
			  )}/uploads/banner_images/${path.basename(bannerImagePath)}`
			: null;
		const uploadedData = {
			userId,
		};

		if (avatarUrl) {
			uploadedData.avatarUrl = avatarUrl;
		}

		if (bannerUrl) {
			uploadedData.bannerUrl = bannerUrl;
		}

		// const result = await updateUserPhotos({ avatarUrl, bannerUrl, userId });
		const result = await updateUserPhotos(uploadedData);

		res.json({ message: "Photos uploaded successfully", data: result });
	} catch (error) {
		console.log("Line-117", error.message);
		return res.status(error.status || 500).json({ error: error.message });
	}
};

export const handleAuthUser = async (req, res) => {
	const userId = req.user._id;

	// console.log(userId);

	if (!userId) res.status(404).json({ message: "User not found" });

	const user = await authUser(userId);

	// console.log(user);

	res.json({ message: "Login User", data: user });
};
