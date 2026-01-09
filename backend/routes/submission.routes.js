// import express from "express";
// import authMiddleware from "../middlewares/authMiddleware.js";

// import {
//   getAllSubmissions,
//   deleteSubmission,
//    downloadAnswerSheet
// } from "../controllers/submission.controller.js";

// const router = express.Router();

// router.get("/admin/submissions", authMiddleware, getAllSubmissions);
// router.delete("/admin/submissions/:id", authMiddleware, deleteSubmission);

// export default router;




import express from 'express';
import {
  submitExam,
  getAllSubmissions,
  getMySubmissions,
  evaluateSubmission,
  getMyResults
} from '../controllers/submission.controller.js';
import authMiddleware, { isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/api/submit-exam', authMiddleware, submitExam);
router.get('/api/admin/submissions/', authMiddleware, isAdmin, getAllSubmissions);
router.get('/api/my-submissions', authMiddleware, getMySubmissions);
router.get('/api/my-results', authMiddleware, getMyResults); // ✅ Get student's results by userId
router.post('/api/admin/evaluate/:submissionId', authMiddleware, isAdmin, evaluateSubmission);

export default router;
