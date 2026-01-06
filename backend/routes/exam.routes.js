// import express from 'express';
// import {
//   createExam,
//   getAllExams,
//   getExamById,
//   updateExam,
//   deleteExam,
//   getActiveExams,
//   getExamsByType
// //   publishExam
// } from '../controllers/exam.controller.js';
// import authMiddleware, { isAdmin, requireRoles } from '../middlewares/authMiddleware.js';

// const router = express.Router();

// // Public routes (authenticated users)
// router.get('/', authMiddleware, getAllExams);
// router.get('/active', authMiddleware, getActiveExams);
// router.get('/type/:type', authMiddleware, getExamsByType);
// // router.get('/subject/:subject', getExams);
// router.get('/:examId', authMiddleware, getExamById);

// // Admin routes
// router.post('/', authMiddleware, isAdmin, createExam);
// router.put('/:examId', authMiddleware, isAdmin, updateExam);
// router.delete('/:examId', authMiddleware, isAdmin, deleteExam);

// export default router;



import express from 'express';
import {
  createExam,
  getAllExams,
  getExamById,
  addQuestion,
  getQuestionsByExam,
  deleteQuestion,
  deleteExam
} from '../controllers/exam.controller.js';
import authMiddleware, { isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, isAdmin, createExam);
router.get('/', authMiddleware, getAllExams);
router.get('/:examId', authMiddleware, getExamById);

router.post('/:examId/questions', authMiddleware, isAdmin, addQuestion);
router.get('/:examId/questions', authMiddleware, getQuestionsByExam);
router.delete('/:examId/questions/:questionId', authMiddleware, isAdmin, deleteQuestion);
router.delete('/:examId', authMiddleware, isAdmin, deleteExam);

export default router;