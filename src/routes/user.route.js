import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
	handleUser,
	handleUpdateUser,
	handleUpdateUserPhotos,
	handleAuthUser,
	handleUpdateUserTheme,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/file.middleware.js";
import { validateMiddleware } from "../middlewares/validation.middleware.js";

import {
	updateUserPhotoSchema,
	updateUserDetailsSchema,
} from "../validations/user.validation.js";

const userRoute = Router();

// userRoute.use(authMiddleware);
userRoute.get("/me", authMiddleware, handleAuthUser);
userRoute.get("/:id", handleUser);

userRoute.use(authMiddleware);
userRoute.put(
	"/",
	validateMiddleware(updateUserDetailsSchema),

	handleUpdateUser
);
userRoute.post(
	"/photos",

	validateMiddleware(updateUserPhotoSchema),
	upload.fields([
		{ name: "avatar", maxCount: 1 },
		{ name: "banner_image", maxCount: 1 },
	]),
	handleUpdateUserPhotos
);
userRoute.patch("/theme", handleUpdateUserTheme);
export default userRoute;
