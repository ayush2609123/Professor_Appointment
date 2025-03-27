import { Router } from "express";
import { createReview, getProfessorReviews } from "../controllers/review.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Create a review (only accessible to students)
router.post("/", verifyJWT, createReview);

// Get all reviews for a specific professor
router.get("/professor/:professorId", verifyJWT, getProfessorReviews);

export default router;
