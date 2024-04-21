import { Router } from "express";
import {
	handleCreateBlogPost,
	handleAllPublishedBlogPost,
	handleAuthorPublishedBlogPosts,
	handlePublishBlogPost,
	handleSingleBlogPost,
	handleAllPersonalBlogPosts,
	handleUpdateBlogPost,
} from "../controllers/blog.controller.js";
import { validateMiddleware } from "../middlewares/validation.middleware.js";
import { blogPostSchema } from "../validations/blog.validation.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const blogRoute = Router();

blogRoute.get("/", handleAllPublishedBlogPost);
blogRoute.get("/:postId", handleSingleBlogPost);
blogRoute.get("/authors/:id", handleAuthorPublishedBlogPosts);

blogRoute.use(authMiddleware);
blogRoute.post("/", validateMiddleware(blogPostSchema), handleCreateBlogPost);
blogRoute.put(
	"/:postId",
	validateMiddleware(blogPostSchema),
	handleUpdateBlogPost
);
blogRoute.get("/p/mypost", handleAllPersonalBlogPosts);
blogRoute.get("/publish/:id", handlePublishBlogPost);

export default blogRoute;
