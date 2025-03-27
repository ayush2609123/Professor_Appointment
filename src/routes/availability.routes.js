import { Router } from "express";
import { setAvailability, getAvailability } from "../controllers/availability.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Professor sets availability (authenticated)
router.post("/", verifyJWT, setAvailability);

// Student (or any authenticated user) views available slots for a specific professor
router.get("/:professorId", verifyJWT, getAvailability);

export default router;

