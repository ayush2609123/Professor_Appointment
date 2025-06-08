import { Router } from "express";
import { bookAppointment, cancelAppointment, getStudentAppointments } from "../controllers/appointment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", verifyJWT, bookAppointment);


router.patch("/:appointmentId/cancel", verifyJWT, cancelAppointment);

router.get("/mine", verifyJWT, getStudentAppointments);

export default router;
