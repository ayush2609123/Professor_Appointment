import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Availability } from "../models/availability.model.js";
import { Appointment } from "../models/appointment.model.js";

/**
 * Professor sets availability.
 * Endpoint: POST /api/availability
 * Expected body: { date: "2025-03-25", timeSlot: "10:00 AM - 11:00 AM" }
 */
export const setAvailability = asyncHandler(async (req, res) => {
  // Only professors are allowed to set availability.
  if (req.user.role !== "professor") {
    throw new ApiError(403, "Only professors can set availability");
  }
  
  const { date, timeSlot } = req.body;
  if (!date || !timeSlot) {
    throw new ApiError(400, "Date and timeSlot are required");
  }
  
  const newAvailability = await Availability.create({
    professorId: req.user._id,
    date,
    timeSlot,
    isBooked: false,
  });
  
  return res
    .status(201)
    .json(new ApiResponse(201, newAvailability, "Availability set successfully"));
});

/**
 * Student views available slots for a professor.
 * Endpoint: GET /api/availability/:professorId
 */
export const getAvailability = asyncHandler(async (req, res) => {
  const { professorId } = req.params;
  if (!professorId) {
    throw new ApiError(400, "Professor ID is required");
  }
  
  const availabilities = await Availability.find({
    professorId,
    isBooked: false,
  });
  
  return res
    .status(200)
    .json(new ApiResponse(200, availabilities, "Available slots fetched successfully"));
});