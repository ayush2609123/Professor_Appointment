import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
      const bearer = req.header("Authorization");
      if (!bearer || !bearer.startsWith("Bearer ")) {
        throw new ApiError(401, "Unauthorized request: No token provided");
      }

      const token = bearer.replace("Bearer ", "");
      if (!token) {
        throw new ApiError(401, "Unauthorized request: No token provided");
      }
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      if (!decodedToken || !decodedToken._id) {
        throw new ApiError(401, "Invalid access token");
      }
      const user = await User.findById(decodedToken._id).select("-password -refreshToken");
      if (!user) {
        throw new ApiError(401, "User not found for provided token");
      }
  
      if (!user.role) {
        throw new ApiError(401, "User role is not defined");
      }
  
      req.user = user;
      next();
    } catch (error) {
      throw new ApiError(401, error?.message || "Invalid access token");
    }
  });
  
