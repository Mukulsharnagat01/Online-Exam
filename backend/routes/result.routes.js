import express from 'express';
import {
  submitExam,
  getMySubmissions,
  getSubmissionById,
  getExamResults,
  evaluateSubmission
} from '../controllers/result.controller.js';
import authMiddleware, { isAdmin, isStudent, requireRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Student routes
router.post('/submit', authMiddleware, isStudent, submitExam);
router.get('/my', authMiddleware, isStudent, getMySubmissions);
router.get('/:submissionId', authMiddleware, getSubmissionById);

// Admin/Teacher routes
router.get('/exam/:examId', authMiddleware, requireRoles('admin', 'teacher'), getExamResults);
router.post('/evaluate/:submissionId', authMiddleware, requireRoles('admin', 'teacher'), evaluateSubmission);

export default router;