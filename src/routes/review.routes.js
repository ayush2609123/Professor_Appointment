import { Router } from "express";
import { createReview, getProfessorReviews } from "../controllers/review.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", verifyJWT, createReview);


router.get("/professor/:professorId", verifyJWT, getProfessorReviews);

export default router;
