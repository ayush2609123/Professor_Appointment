import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Availability } from "../models/availability.model.js";
import { Appointment } from "../models/appointment.model.js";


export const bookAppointment = asyncHandler(async (req, res) => {
  if (req.user.role !== "student") {
    throw new ApiError(403, "Only students can book appointments");
  }
  
  const { professorId, date, timeSlot } = req.body;
  if (!professorId || !date || !timeSlot) {
    throw new ApiError(400, "Professor ID, date and timeSlot are required");
  }
  
  const availability = await Availability.findOne({
    professorId,
    date,
    timeSlot,
    isBooked: false,
  });
  
  if (!availability) {
    throw new ApiError(400, "Time slot is not available");
  }
  const appointment = await Appointment.create({
    professorId,
    studentId: req.user._id,
    date,
    timeSlot,
    status: "booked",
    rescheduledFromId: null,
  });
  availability.isBooked = true;
  await availability.save();
  
  return res
    .status(201)
    .json(new ApiResponse(201, appointment, "Appointment booked successfully"));
});

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

export const getStudentAppointments = asyncHandler(async (req, res) => {

  if (req.user.role !== "student") {
    throw new ApiError(403, "Only students can check appointments");
  }
  

  const appointments = await Appointment.find({
    studentId: req.user._id,
    status: { $ne: "canceled" },
  });
  
  return res
    .status(200)
    .json(new ApiResponse(200, appointments, "Appointments fetched successfully"));
});
