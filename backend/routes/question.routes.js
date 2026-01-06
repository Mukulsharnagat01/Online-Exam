import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getQuestionsByExam,
  addQuestion,
  deleteQuestion
} from "../controllers/question.controller.js";

const router = express.Router();

// ✅ exam-wise questions
router.get("/:examId", authMiddleware, getQuestionsByExam);

// ✅ add question to exam
router.post("/:examId", authMiddleware, addQuestion);

// ✅ delete question
router.delete("/:examId/:questionId", authMiddleware, deleteQuestion);

export default router;
