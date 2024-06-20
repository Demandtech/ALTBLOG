import { Router } from "express";
import {
	handleCreatePost,
	handleAllPublishedPost,
	handleAuthorPosts,
	handlePublishPost,
	handleSinglePost,
	handleUpdatePost,
	handleDeletePost,
	handleAllPosts,
	handleFeaturedPost,
	handleRelatedPost,
} from "../controllers/post.controller.js";
import { validateMiddleware } from "../middlewares/validation.middleware.js";
import {
	createPostSchema,
	updatePostSchema,
} from "../validations/post.validation.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

import {
	handlebookmarkPost,
	handleBookmarkList,
} from "../controllers/bookmark.controller.js";
// import ipMiddleware from "../middlewares/getip.middleware.js";

const blogRoute = Router();

blogRoute.get("/", handleAllPublishedPost);
blogRoute.get("/featured", handleFeaturedPost);
blogRoute.get("/:postId", handleSinglePost);
blogRoute.get("/authors/:id", handleAuthorPosts);

// AUTH MIDDLEWARE
blogRoute.use(authMiddleware);
blogRoute.post("/", validateMiddleware(createPostSchema), handleCreatePost);
blogRoute.put(
	"/:postId",
	validateMiddleware(updatePostSchema),
	handleUpdatePost
);

blogRoute.get("/publish/:id", handlePublishPost);
blogRoute.delete("/:postId", handleDeletePost);

blogRoute.get("/bookmark/:id", handlebookmarkPost);
blogRoute.get("/user/bookmarks", handleBookmarkList);
blogRoute.get("/related/:postId", handleRelatedPost);

blogRoute.use(adminMiddleware);
blogRoute.get("/admin/all", handleAllPosts);

export default blogRoute;
