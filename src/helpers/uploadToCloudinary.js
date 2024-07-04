import cloudinary from "../configs/cloudinary.js";

const uploadToCloudinary = async (filePath, public_id) => {
	return new Promise((resolve, reject) => {
		const options = {
			public_id,
		};

		if (public_id.includes("avatar")) {
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

		if (public_id.includes("banner")) {
			options.transformation = [
				{
					height: 350,
					quality: "auto",
					fetch_format: "auto",
				},
			];
		}

		cloudinary.uploader.upload(filePath, options, (error, result) => {
			if (error) {
				console.log(error);
				return reject(error);
			}
			resolve(result.secure_url);
		});
	});
};

export default uploadToCloudinary;
