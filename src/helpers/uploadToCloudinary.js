import cloudinary from "../configs/cloudinary.js";
import fs from "fs";
import streamifier from "streamifier";

const uploadToCloudinary = async (buffer, public_id, folder) => {
	return new Promise((resolve, reject) => {
		const options = {
			folder: folder,
			public_id,
			overwrite: true,
			quality: "auto",
			fetch_format: "png",
		};

		if (folder === "avatars") {
			options.transformation = [
				{
					width: 150,
					height: 150,
					quality: "auto",
					fetch_format: "auto",
					crop: "limit",
				},
			];
		}

		if (folder === "banners") {
			options.transformation = [
				{
					height: 350,
					quality: "auto",
					fetch_format: "auto",
				},
			];
		}

		const stream = cloudinary.uploader.upload_stream(
			options,
			(error, result) => {
				if (error) {
					console.log(error);
					return reject(error);
				}

				resolve(result.secure_url);
			}
		);

		streamifier.createReadStream(buffer).pipe(stream);
	});
};

export default uploadToCloudinary;
