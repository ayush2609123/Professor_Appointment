import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Review } from "../models/rating.model.js";

export const createReview = asyncHandler(async (req, res) => {
 
  if (req.user.role !== "student") {
    throw new ApiError(403, "Only students can submit reviews");
  }
  
  const { professorId, appointmentId, rating, feedback } = req.body;
  
  if (!professorId || !appointmentId || !rating) {
    throw new ApiError(400, "Professor ID, appointment ID, and rating are required");
  }
  
  const review = await Review.create({
    studentId: req.user._id,
    professorId,
    appointmentId,
    rating,
    feedback,
  });
  
  return res.status(201).json(new ApiResponse(201, review, "Review submitted successfully"));
});

export const getProfessorReviews = asyncHandler(async (req, res) => {
  const { professorId } = req.params;
  if (!professorId) {
    throw new ApiError(400, "Professor ID is required");
  }
  
  const reviews = await Review.find({ professorId }).sort({ createdAt: -1 });
  
  return res.status(200).json(new ApiResponse(200, reviews, "Professor reviews fetched successfully"));
});
