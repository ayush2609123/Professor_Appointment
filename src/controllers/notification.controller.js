import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Notification } from "../models/notification.model.js";

export const getNotifications = asyncHandler(async (req, res) => {
  
  const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
  
  return res.status(200).json(new ApiResponse(200, notifications, "Notifications fetched successfully"));
});

export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  if (!notificationId) {
    throw new ApiError(400, "Notification ID is required");
  }
  
  const notification = await Notification.findOne({ _id: notificationId, userId: req.user._id });
  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }
  
  notification.isRead = true;
  await notification.save();
  
  return res.status(200).json(new ApiResponse(200, notification, "Notification marked as read"));
});
