import mongoose from "mongoose";
import notificationSchema from "../schemas/notification.schema.js";

const notificationModel = mongoose.model("Notification", notificationSchema);

export default notificationModel;
