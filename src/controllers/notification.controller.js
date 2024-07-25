import NotificationService from "../services/notification.service.js";

export default class NotificationController {
  #services;

  constructor() {
    this.#services = new NotificationService();
  }
  async handleGetAllNotifications(req, res) {
    const userId = req.user._id;
    try {
      const notification = await this.#services.getAllNotifications(userId);

      res.status(200).json({
        message: "All user notification",
        data: notification,
      });
    } catch (err) {
      res
        .status(err.status || 500)
        .json({ message: err.message || "An error occured" });
    }
  }
}
