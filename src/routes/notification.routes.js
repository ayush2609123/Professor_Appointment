import { Router } from "express";
import { getNotifications, markNotificationAsRead } from "../controllers/notification.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", verifyJWT, getNotifications);


router.patch("/:notificationId/read", verifyJWT, markNotificationAsRead);

export default router;
