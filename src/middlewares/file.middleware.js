import multer from "multer";

const imageFilter = function (_, file, cb) {
	const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
	if (allowedMimeTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error("Only JPEG, JPG, and PNG image files are allowed!"), false);
	}
};

const mediaStorage = multer.memoryStorage();

export const upload = multer({
	storage: mediaStorage,
	fileFilter: imageFilter,
});
