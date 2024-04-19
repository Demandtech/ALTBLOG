import { Router } from "express";
import { handleCreateBlogPost } from "../controllers/blog.controller.js";
import { validateMiddleware } from "../middlewares/validation.middleware.js";
import { createBlogPostSchema } from "../validations/blog.validation.js";

const blogRoute = Router();

blogRoute.post(
	"/",
	validateMiddleware(createBlogPostSchema),
	handleCreateBlogPost
);

export default blogRoute;
