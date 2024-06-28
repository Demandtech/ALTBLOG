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

const authRoute = Router();

authRoute.post("/register", validateMiddleware(registerSchema), handleRegister);
authRoute.post("/login", validateMiddleware(loginSchema), handleLogin);

authRoute.use(authMiddleware);
authRoute.post(
	"/changepassword",
	validateMiddleware(changePasswordSchema),
	handleChangePassword
);
export default authRoute;
