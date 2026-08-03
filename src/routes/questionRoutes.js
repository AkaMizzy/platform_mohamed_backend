import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  submitQuestion,
  getPublishedQuestions,
  getQuestions,
  getQuestionById,
  answerQuestion,
  setPublished,
  deleteQuestion,
} from "../controllers/questionController.js";

const router = Router();

// Public routes
router.post("/", submitQuestion);
router.get("/published", getPublishedQuestions);

// Admin routes
router.get("/", requireAuth, getQuestions);
router.get("/:id", requireAuth, getQuestionById);
router.put("/:id/answer", requireAuth, answerQuestion);
router.patch("/:id/publish", requireAuth, setPublished);
router.delete("/:id", requireAuth, deleteQuestion);

export default router;
