import { Router } from "express";
import {
	handleCreateBlogPost,
	handleAllBlogPost,
	handleAuthorBlogPosts,
	handlePublishBlogPost,
	handleSingleBlogPost,
} from "../controllers/blog.controller.js";
import { validateMiddleware } from "../middlewares/validation.middleware.js";
import { createBlogPostSchema } from "../validations/blog.validation.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const blogRoute = Router();

blogRoute.get("/", handleAllBlogPost);
blogRoute.get("/:postId", handleSingleBlogPost);

blogRoute.use(authMiddleware);
blogRoute.post(
	"/",
	validateMiddleware(createBlogPostSchema),
	handleCreateBlogPost
);
blogRoute.get("/authors/:id", handleAuthorBlogPosts);
blogRoute.get("/publish/:id", handlePublishBlogPost);

export default blogRoute;
