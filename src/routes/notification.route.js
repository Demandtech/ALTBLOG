import { Router } from "express";
import NotificationController from "../controllers/notification.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const notificationRoute = Router();

const controllers = new NotificationController();
notificationRoute.use(authMiddleware);
notificationRoute.get("/", controllers.handleGetAllNotifications);
export default notificationRoute;
