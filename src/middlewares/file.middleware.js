import multer from "multer";
import path from "path";
import { dir_name } from "../index.js";

const imageFilter = function (req, file, cb) {
	const allowedMimeTypes = [
		"image/jpeg",
		"image/png",
		"image/gif",
		"image/svg+xml",
	];
	if (allowedMimeTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error("Only image files are allowed!"), false);
	}
};

const mediaStorage = multer.diskStorage({
	destination: function (req, file, cb) {
		const where = file.fieldname + "s";
		const uploadPath = path.join(dir_name, "uploads", where);
		cb(null, uploadPath);
	},
	filename: function (req, file, cb) {
		const where = file.fieldname;
		const name = `${req.user.name}-${where}.${
			file.originalname.split(".")[file.originalname.split(".").length - 1]
		}`.toLowerCase();
		cb(null, name);
	},
});

export const upload = multer({
	storage: mediaStorage,
	fileFilter: imageFilter,
});
