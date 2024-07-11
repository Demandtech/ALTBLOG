import multer from "multer";
import path from "path";
import { dir_name } from "../index.js";

const imageFilter = function (_, file, cb) {
	const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
	if (allowedMimeTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error("Only JPEG, JPG, and PNG image files are allowed!"), false);
	}
};

// const mediaStorage = multer.diskStorage({
// 	destination: function (_, file, cb) {
// 		const where = file.fieldname + "s";
// 		const uploadPath = path.join(dir_name, "uploads", where);
// 		cb(null, uploadPath);
// 	},
// 	filename: function (req, file, cb) {
// 		const where = file.fieldname;
// 		const name = `${req.user.name}-${where}-${req.user._id}.png`.toLowerCase();
// 		cb(null, name);
// 	},
// });

const mediaStorage = multer.memoryStorage();

export const upload = multer({
	storage: mediaStorage,
	fileFilter: imageFilter,
});
