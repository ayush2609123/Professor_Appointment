import { Router } from "express";
import { setAvailability, getAvailability } from "../controllers/availability.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", verifyJWT, setAvailability);
router.get("/:professorId", verifyJWT, getAvailability);

export default router;

