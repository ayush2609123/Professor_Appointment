import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

export const genAccessTokandRefreshTok = async (userId) => {
  try {
    const userDoc = await User.findById(userId);
    if (!userDoc) {
      throw new ApiError(404, "User not found for token generation");
    }
    const accessToken = userDoc.generateAccessToken();
    const refreshToken = userDoc.generateRefreshToken();
    userDoc.refreshToken = refreshToken;
    await userDoc.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Token generation error:", error);
    throw new ApiError(500, "Error generating access token or refresh token");
  }
};

export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password, role } = req.body;
  if ([fullName, email, username, password].some((field) => !field?.trim())) {
    throw new ApiError(400, "All fields (fullName, email, username, password) are required");
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }
  const existingUser = await User.findOne({
    $or: [
      { username: username.toLowerCase() },
      { email: email.toLowerCase() }
    ],
  });
  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path || null;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatarUpload = await uploadOnCloudinary(avatarLocalPath);
  if (!avatarUpload) {
    throw new ApiError(500, "Failed to upload avatar to Cloudinary");
  }

  let coverImageUpload = null;
  if (coverImageLocalPath) {
    coverImageUpload = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImageUpload) {
      throw new ApiError(500, "Failed to upload cover image to Cloudinary");
    }
  }
  const userDoc = await User.create({
    fullName,
    email: email.toLowerCase(),
    username: username.toLowerCase(),
    password,
    role: role ? role.toLowerCase() : "student",
    avatar: avatarUpload.url,
    coverImage: coverImageUpload?.url || "",
  });

  const createdUser = await User.findById(userDoc._id).select("-password -refreshToken");
  if (!createdUser) {
    throw new ApiError(500, "Failed to create user");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  const findUser = await User.findOne({
    $or: [
      { username: username?.toLowerCase() },
      { email: email?.toLowerCase() }
    ],
  });
  if (!findUser) {
    throw new ApiError(404, "User not found");
  }
  const isPasswordValid = await findUser.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }
  const { accessToken, refreshToken } = await genAccessTokandRefreshTok(findUser._id);
  return res.status(200).json({
    statusCode: 200,
    data: {
      accessToken,
      refreshToken,
      userId: findUser._id,
    },
    message: "Login successful",
    success: true,
  });
});

export const AccessRefressToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request: No refresh token provided");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const userDoc = await User.findById(decodedToken._id);
  if (!userDoc) {
    throw new ApiError(401, "Invalid refresh token: User not found");
  }
  if (incomingRefreshToken !== userDoc.refreshToken) {
    throw new ApiError(401, "Refresh token expired or mismatched");
  }
  const { accessToken, refreshToken: newRefreshToken } = await genAccessTokandRefreshTok(userDoc._id);

  return res
    .status(200)
    .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed successfully"));
});

export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: "" } }, { new: true });
  return res.status(200).json(new ApiResponse(200, {}, "User logged out successfully"));
});

export const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPass, newPass } = req.body;
  const userDoc = await User.findById(req.user._id);
  if (!userDoc) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordCorrect = await userDoc.isPasswordCorrect(oldPass);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  userDoc.password = newPass;
  await userDoc.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

export const getcurrUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});
