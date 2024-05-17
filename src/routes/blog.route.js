import { Router } from "express";
import {
	handleCreateBlogPost,
	handleAllPublishedBlogPost,
	handleAuthorBlogPosts,
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
import { handleLikePost } from "../controllers/like.controller.js";
import {
	handlebookmarkPost,
	handleBookmarkList,
} from "../controllers/bookmark.controller.js";

const blogRoute = Router();

blogRoute.get("/", handleAllPublishedBlogPost);
blogRoute.get("/:postId", handleSingleBlogPost);
blogRoute.get("/authors/:id", handleAuthorBlogPosts);

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
blogRoute.get("/like/:id", handleLikePost);
blogRoute.get("/bookmark/:id", handlebookmarkPost);
blogRoute.get("/user/bookmark", handleBookmarkList);

blogRoute.use(adminMiddleware);
blogRoute.get("/admin/all", handleAllBlogPost);

export default blogRoute;
