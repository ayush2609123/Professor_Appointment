import { Router } from "express";
import { getNotifications, markNotificationAsRead } from "../controllers/notification.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Get all notifications for the authenticated user.
router.get("/", verifyJWT, getNotifications);

// Mark a specific notification as read.
router.patch("/:notificationId/read", verifyJWT, markNotificationAsRead);

export default router;
