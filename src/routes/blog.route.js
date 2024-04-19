import { Router } from "express";
import {
	handleCreateBlogPost,
	handleAllBlogPost,
	handleOwnerBlogPosts,
} from "../controllers/blog.controller.js";
import { validateMiddleware } from "../middlewares/validation.middleware.js";
import { createBlogPostSchema } from "../validations/blog.validation.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const blogRoute = Router();

blogRoute.get("/", handleAllBlogPost);

blogRoute.use(authMiddleware);

blogRoute.post(
	"/",
	validateMiddleware(createBlogPostSchema),
	handleCreateBlogPost
);
blogRoute.get("/me", handleOwnerBlogPosts);

export default blogRoute;
