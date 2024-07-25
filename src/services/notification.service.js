import notificationModel from "../databases/models/notification.model.js";
import { ErrorAndStatus } from "../exceptions/errorandstatus.js";

export default class NotificationService {
 async getAllNotifications(userId) {
    try {
      const notifications = await notificationModel.find({ owernerId: userId });

      console.log(notifications);
    } catch (err) {
      throw new ErrorAndStatus(
        err.message || "Server internal error, please try again!",
        err.status || 500
      );
    }
  }
}
