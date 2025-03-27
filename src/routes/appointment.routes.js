import { Router } from "express";
import { bookAppointment, cancelAppointment, getStudentAppointments } from "../controllers/appointment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Student books an appointment with a professor.
router.post("/", verifyJWT, bookAppointment);

// Professor cancels an appointment.
router.patch("/:appointmentId/cancel", verifyJWT, cancelAppointment);

// Student checks their pending appointments.
router.get("/mine", verifyJWT, getStudentAppointments);

export default router;
