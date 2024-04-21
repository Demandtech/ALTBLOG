import { Router } from "express";
import {
	handleCreateBlogPost,
	handleAllPublishedBlogPost,
	handleAuthorPublishedBlogPosts,
	handlePublishBlogPost,
	handleSingleBlogPost,
	handleAllPersonalBlogPosts,
	handleUpdateBlogPost,
	handleDeleteBlogPost,
	handleAllBlogPost,
} from "../controllers/blog.controller.js";
import { validateMiddleware } from "../middlewares/validation.middleware.js";
import {
	createBlogPostSchema,
	updateBlogPostSchema,
} from "../validations/blog.validation.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const blogRoute = Router();

blogRoute.get("/", handleAllPublishedBlogPost);
blogRoute.get("/:postId", handleSingleBlogPost);
blogRoute.get("/authors/:id", handleAuthorPublishedBlogPosts);

// AUTH MIDDLEWARE
blogRoute.use(authMiddleware);
blogRoute.post(
	"/",
	validateMiddleware(createBlogPostSchema),
	handleCreateBlogPost
);
blogRoute.put(
	"/:postId",
	validateMiddleware(updateBlogPostSchema),
	handleUpdateBlogPost
);
blogRoute.get("/p/mypost", handleAllPersonalBlogPosts);
blogRoute.get("/publish/:id", handlePublishBlogPost);

blogRoute.delete("/:postId", handleDeleteBlogPost);

blogRoute.get("/admin/all", adminMiddleware, handleAllBlogPost);
export default blogRoute;
