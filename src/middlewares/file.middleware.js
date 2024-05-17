import multer from "multer";
import path from "path";
import { dir_name } from "../index.js";

// const __dirname = path.dirname(new URL(import.meta.url).pathname)

const mediaStorage = multer.diskStorage({
	destination: function (req, file, cb) {
		const where = file.fieldname + "s";
		const uploadPath = path.join(dir_name, "uploads", where);
		cb(null, uploadPath);
	},
	filename: function (req, file, cb) {
		const where = file.fieldname;
		cb(
			null,
			`${req.user.name}-${where}.${
				file.originalname.split(".")[file.originalname.split(".").length - 1]
			}`.toLowerCase()
		); // You can customize the filename if needed
	},
});

export const upload = multer({ storage: mediaStorage });
