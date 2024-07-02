import { Router } from "express";
import {
	handleRegister,
	handleLogin,
	handleChangePassword,
} from "../controllers/auth.controller.js";

import {
	registerSchema,
	loginSchema,
	changePasswordSchema,
} from "../validations/auth.validation.js";
import { validateMiddleware } from "../middlewares/validation.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
	handleGoogleToken,
	handleGoogleUrl,
} from "../controllers/0auth.controller.js";

const authRoute = Router();

authRoute.post("/register", validateMiddleware(registerSchema), handleRegister);
authRoute.post("/login", validateMiddleware(loginSchema), handleLogin);
authRoute.get("/google/url", handleGoogleUrl);
authRoute.get("/google/token", handleGoogleToken);

authRoute.use(authMiddleware);
authRoute.post(
	"/changepassword",
	validateMiddleware(changePasswordSchema),
	handleChangePassword
);
export default authRoute;
