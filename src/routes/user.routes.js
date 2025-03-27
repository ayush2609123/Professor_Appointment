import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  AccessRefressToken,
  changeCurrentPassword,
  getcurrUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Register a new user (handles avatar and coverImage uploads)
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

// User login
router.route("/login").post(loginUser);

// Secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refreshAccessToken").post(AccessRefressToken);
router.route("/change-Password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getcurrUser);

export default router;
