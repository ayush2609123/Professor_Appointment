import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Availability } from "../models/availability.model.js";
import { Appointment } from "../models/appointment.model.js";

/**
 * Student books an appointment with a professor.
 * Endpoint: POST /api/appointments
 * Expected body: { professorId: "profId", date: "2025-03-25", timeSlot: "10:00 AM - 11:00 AM" }
 */
export const bookAppointment = asyncHandler(async (req, res) => {
  // Only students can book appointments.
  if (req.user.role !== "student") {
    throw new ApiError(403, "Only students can book appointments");
  }
  
  const { professorId, date, timeSlot } = req.body;
  if (!professorId || !date || !timeSlot) {
    throw new ApiError(400, "Professor ID, date and timeSlot are required");
  }
  
  // Check if the availability exists and is not already booked.
  const availability = await Availability.findOne({
    professorId,
    date,
    timeSlot,
    isBooked: false,
  });
  
  if (!availability) {
    throw new ApiError(400, "Time slot is not available");
  }
  
  // Create a new appointment.
  const appointment = await Appointment.create({
    professorId,
    studentId: req.user._id,
    date,
    timeSlot,
    status: "booked",
    rescheduledFromId: null,
  });
  
  // Mark the slot as booked.
  availability.isBooked = true;
  await availability.save();
  
  return res
    .status(201)
    .json(new ApiResponse(201, appointment, "Appointment booked successfully"));
});

/**
 * Professor cancels an appointment.
 * Endpoint: PATCH /api/appointments/:appointmentId/cancel
 */
export const cancelAppointment = asyncHandler(async (req, res) => {
  // Only professors can cancel appointments.
  if (req.user.role !== "professor") {
    throw new ApiError(403, "Only professors can cancel appointments");
  }
  
  const { appointmentId } = req.params;
  if (!appointmentId) {
    throw new ApiError(400, "Appointment ID is required");
  }
  
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }
  
  // Ensure the appointment belongs to the professor making the request.
  if (appointment.professorId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to cancel this appointment");
  }
  
  appointment.status = "canceled";
  await appointment.save();
  
  // Optionally, update the related availability back to available.
  const availability = await Availability.findOne({
    professorId: req.user._id,
    date: appointment.date,
    timeSlot: appointment.timeSlot,
  });
  if (availability) {
    availability.isBooked = false;
    await availability.save();
  }
  
  return res
    .status(200)
    .json(new ApiResponse(200, appointment, "Appointment canceled successfully"));
});

/**
 * Student checks their pending appointments.
 * Endpoint: GET /api/appointments/mine
 */
export const getStudentAppointments = asyncHandler(async (req, res) => {
  // Only students can check their appointments.
  if (req.user.role !== "student") {
    throw new ApiError(403, "Only students can check appointments");
  }
  
  // Fetch appointments that are not canceled.
  const appointments = await Appointment.find({
    studentId: req.user._id,
    status: { $ne: "canceled" },
  });
  
  return res
    .status(200)
    .json(new ApiResponse(200, appointments, "Appointments fetched successfully"));
});
