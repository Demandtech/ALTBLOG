import mongoose from "mongoose";
import postModel from "../databases/models/post.model.js";
import UserModel from "../databases/models/user.model.js";
import { ErrorAndStatus } from "../exceptions/errorandstatus.js";
import { postLikeModel } from "../databases/models/like.model.js";
import { redisClient } from "../server.js";

export const user = async (userId, authId) => {
	if (!userId) throw new ErrorAndStatus("User id is required", 400);

	try {
		// const cacheKey = `user:${userId}:${authId}`;
		// const cacheData = await redisClient.get(cacheKey);

		// if (cacheData) {
		// 	console.log("Cache");
		// 	return JSON.parse(cacheData);
		// }
		// console.log("Database");
		let user = await UserModel.findById(userId);

		if (!user) throw new ErrorAndStatus("User not found", 404);

		const isAuthUser = userId === authId;

		let totalLikes = await postLikeModel
			.find()
			.populate({ path: "post" })
			.lean();

		totalLikes = totalLikes.filter((likes) => {
			console.log(likes);
			return likes?.post?.author.toString() === userId;
		}).length;

		const userStats = await postModel.aggregate([
			{
				$match: {
					author: new mongoose.Types.ObjectId(userId),
					state: isAuthUser ? { $in: ["PUBLISHED", "DRAFT"] } : "PUBLISHED",
				},
			},
			{
				$group: {
					_id: null,
					totalPublished: {
						$sum: {
							$cond: [{ $eq: ["$state", "PUBLISHED"] }, 1, 0],
						},
					},
					totalDraft: {
						$sum: {
							$cond: [
								{ $and: [{ $eq: ["$state", "DRAFT"] }, isAuthUser] },
								1,
								null,
							],
						},
					},
					totalViews: { $sum: "$read_count" },
					totalReadTime: {
						$sum: {
							$cond: [{ $eq: ["$state", "PUBLISHED"] }, "$reading_time", 0],
						},
					},
					totalPosts: {
						$sum: {
							$cond: [
								isAuthUser
									? { $in: ["$state", ["PUBLISHED", "DRAFT"]] }
									: { $eq: ["$state", "PUBLISHED"] },
								1,
								0,
							],
						},
					},
				},
			},
		]);

		const {
			totalPublished = 0,
			totalViews = 0,
			totalDraft = 0,
			totalReadTime = 0,
			totalPosts = 0,
		} = userStats[0] || {};

		user = user.toObject();

		const user_stats = {
			totalPublished,
			totalDraft,
			totalViews,
			totalReadTime,
			totalPosts,
			totalLikes,
		};

		delete user.password;
		delete user.__v;

		user.stats = user_stats;

		// await redisClient.setEx(cacheKey, 5 * 60, JSON.stringify({ user }));

		return {
			user,
		};
	} catch (error) {
		console.log(error);
		throw new ErrorAndStatus(
			error.message || "Internal Error, try again later!",
			error.status || 500
		);
	}
};

export const updateUser = async (userId, newUser) => {
	if (!userId) throw new ErrorAndStatus("Id is required!", 400);

	try {
		const user = await UserModel.findById(userId);

		if (!user) throw new ErrorAndStatus("User not found", 404);

		Object.assign(user, newUser);

		await user.save();

		return user;
	} catch (error) {
		throw ErrorAndStatus("An error occured!", 500);
	}
};

export const updateUserPhotos = async ({
	avatarUrl = null,
	bannerUrl = null,
	userId,
}) => {
	if (!userId) throw new ErrorAndStatus("Id is required!", 400);
	if (!avatarUrl && !bannerUrl)
		throw new ErrorAndStatus("Id is required!", 400);
	try {
		const user = await UserModel.findById(userId);

		if (!user) throw new ErrorAndStatus("User not found", 404);

		user.banner_image = bannerUrl || user.banner_image; // Update only if provided
		user.avatar = avatarUrl || user.avatar;

		await user.save();

		return user;
	} catch (error) {
		throw new ErrorAndStatus(error.message || "An error occured!", 500);
	}
};

export const authUser = async (userId) => {
	if (!userId) throw new ErrorAndStatus("Id is required", 404);

	try {
		const user = await UserModel.findById(userId);

		if (!user) throw new ErrorWithStatus("User not found", 400);

		// console.log(user);

		return user;
	} catch (error) {
		console.log(error);
	}
};

export const updateUserTheme = async ({ theme, userId }) => {
	if (!userId) throw new ErrorAndStatus("Id is required!", 400);

	try {
		const user = await UserModel.findById(userId);

		if (!user) throw new ErrorAndStatus("User not found", 404);

		user.theme = theme;

		await user.save();

		return user;
	} catch (error) {
		throw ErrorAndStatus("An error occured!", 500);
	}
};
