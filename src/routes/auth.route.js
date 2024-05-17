import { Router } from "express";
import { handleRegister, handleLogin } from "../controllers/auth.controller.js";
import { registerSchema, loginSchema } from "../validations/auth.validation.js";
import { validateMiddleware } from "../middlewares/validation.middleware.js"; 

const authRoute = Router();

authRoute.post("/register", validateMiddleware(registerSchema), handleRegister);
authRoute.post("/login", validateMiddleware(loginSchema), handleLogin);



export default authRoute;
