import express from 'express';
import {
  getStudentDashboard,
  getUpcomingExams,
  getCompletedExams,
  getStudentProfile
} from '../controllers/student.controller.js';
import authMiddleware, { isStudent } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', authMiddleware, isStudent, getStudentDashboard);
router.get('/upcoming-exams', authMiddleware, isStudent, getUpcomingExams);
router.get('/completed-exams', authMiddleware, isStudent, getCompletedExams);
router.get('/profile', authMiddleware, isStudent, getStudentProfile);

export default router;