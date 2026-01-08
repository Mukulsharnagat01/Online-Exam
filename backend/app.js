import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import AuthRoutes from './routes/Auth.routes.js'; // Ye file exist karni chahiye
import DbCon from './db/db.js'; 
import { s3Client } from './config/awsConfig.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// import { Submission } from '../models/Submission.js';
// import { ddb} from '../config/dynamo.js';
// import { PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import questionRoutes from "./routes/question.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import cookieParser from "cookie-parser";
import authMiddleware from './middlewares/authMiddleware.js';
import examRoutes from './routes/exam.routes.js';        // ✅ ADD THIS
import resultRoutes from './routes/result.routes.js';    // ✅ ADD THIS
import studentRoutes from './routes/student.routes.js';  // ✅ ADD THIS


// ,,,,,,
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000; 

// CORS configuration - dono possible frontend ports ko allow kiya
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:5173'],
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());
// Database connection
DbCon();

// ==================== AUTH ROUTES ====================
app.use('/auth', AuthRoutes); // /auth/register, /auth/login etc.
app.use("/questions", questionRoutes);
// app.use('/submissions', submissionRoutes);
app.use('/exams', examRoutes);      // ✅ ADD THIS LINE
app.use('/results', resultRoutes);  // ✅ ADD THIS LINE
app.use('/student', studentRoutes); // ✅ ADD THIS LINE
app.use('/', submissionRoutes);
// ==================== EXAM SYSTEM ROUTES ====================

// In-memory storage (temporary - MongoDB / DynamoDB later)
import inMemoryStore from './db/inMemoryStore.js';
let examSubjects = ['mcq', 'theory', 'coding'];
let questions = {}; // { 'react-js': [...], 'python': [...] }
// use inMemoryStore.submissions for submissions


// Get all subjects
app.get('/api/subjects', (req, res) => {
  res.json(examSubjects);
});

app.post('/api/subjects', async (req, res) => {
  try {
    console.log('📥 Add subject request:', req.body);
    const { subject } = req.body;
    
    if (!subject || !subject.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Subject name is required' 
      });
    }
    
    const formatted = subject.toLowerCase().replace(/\s+/g, '-');
    
    // Check if subject already exists
    if (examSubjects.includes(formatted)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Subject already exists' 
      });
    }
    
    examSubjects.push(formatted);
    questions[formatted] = [];
    
    console.log('✅ Subject added:', formatted, 'Total subjects:', examSubjects);
    
    
    res.status(201).json({ 
      success: true,
      message: 'Subject added successfully',
      subjects: examSubjects 
    });
    
  } catch (error) {
    console.error('Add subject error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// ✅ Delete subject - PROTECTED (Admin only)
app.delete('/api/subjects/:subject', authMiddleware, (req, res) => {
  try {
    // ✅ Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admin can delete subjects' 
      });
    }

    const { subject } = req.params;
    
    // ✅ Check if subject exists
    if (!examSubjects.includes(subject)) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subject not found' 
      });
    }
    
    examSubjects = examSubjects.filter(s => s !== subject);
    delete questions[subject];
    
    res.json({ 
      success: true,
      message: 'Subject deleted successfully', 
      subjects: examSubjects 
    });
    
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get questions for a subject - PUBLIC
app.get('/api/questions/:subject', (req, res) => {
  const { subject } = req.params;
  res.json(questions[subject] || []);
});

// Add question to subject - PROTECTED
app.post('/api/questions/:subject', authMiddleware, (req, res) => {
  try {
    // ✅ Check if user is admin or teacher
    if (!['admin', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admin or teacher can add questions' 
      });
    }

    const { subject } = req.params;
    const { question, options } = req.body;

    if (!questions[subject]) {
      questions[subject] = [];
    }

    const newQuestion = {
      id: Date.now(),
      question,
      options: options || []
    };

    questions[subject].push(newQuestion);
    res.status(201).json({ 
      success: true,
      message: 'Question added successfully',
      question: newQuestion 
    });
    
  } catch (error) {
    console.error('Add question error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Delete question - PROTECTED
app.delete('/api/questions/:subject/:id', authMiddleware, (req, res) => {
  try {
    // ✅ Check if user is admin or teacher
    if (!['admin', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admin or teacher can delete questions' 
      });
    }

    const { subject, id } = req.params;
    if (questions[subject]) {
      questions[subject] = questions[subject].filter(q => q.id != id);
    }
    res.json({ 
      success: true,
      message: 'Question deleted successfully' 
    });
    
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});


app.get('/admin/submissions', authMiddleware, (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admin can view submissions' 
      });
    }
    res.json({
      success: true,
      submissions: inMemoryStore.getSubmissions()
    });
    
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get student submissions summary - PROTECTED
app.get('/api/student-submissions', authMiddleware, (req, res) => {
  try {
    const summary = inMemoryStore.getSubmissions().map(sub => ({
      id: sub.id,
      subject: sub.subject.replace(/-/g, ' '),
      studentName: sub.studentName,
      timestamp: sub.timestamp,
      totalQuestions: sub.answers.length
    }));
    
    res.json({
      success: true,
      submissions: summary
    });
    
  } catch (error) {
    console.error('Student submissions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Submit exam answers
// app.post('/api/submissions', (req, res) => {
//   const submission = {
//     id: Date.now(),
//     timestamp: new Date().toISOString(),
//     subject: req.body.subject,
//     studentName: req.body.studentName || 'Anonymous',
//     answers: req.body.answers
//   };
//   inMemoryStore.addSubmission(submission);
//   res.status(201).json({ message: 'Exam submitted successfully' });
// });

// // Get all submissions (admin)
// app.get('/api/submissions', (req, res) => {
//   res.json(inMemoryStore.getSubmissions());
// });

// Dev: seed exams based on existing submission examIds (creates in-memory exams)
app.post('/api/dev/seed-exams', (req, res) => {
  try {
    const subs = inMemoryStore.getSubmissions();
    const uniqueExamIds = [...new Set(subs.map(s => s.examId).filter(Boolean))];
    const seeded = [];
    uniqueExamIds.forEach((examId) => {
      const existing = inMemoryStore.getExamById(examId);
      if (!existing) {
        const exam = {
          examId,
          title: `Seeded exam ${examId}`,
          subject: 'seeded',
          duration: 60,
          totalMarks: 100,
          questions: [],
          createdAt: new Date().toISOString(),
          status: 'active'
        };
        inMemoryStore.addExam(exam);
        seeded.push(exam);
      }
    });
    res.json({ success: true, seeded, message: `Seeded ${seeded.length} exams` });
  } catch (err) {
    console.error('Seed exams error', err);
    res.status(500).json({ success: false, message: 'Failed to seed exams' });
  }
});

// Get student submissions summary
app.get('/api/student-submissions', (req, res) => {
  const summary = submissions.map(sub => ({
    id: sub.id,
    subject: sub.subject.replace(/-/g, ' '),
    studentName: sub.studentName,
    timestamp: sub.timestamp,
    totalQuestions: sub.answers.length
  }));
  res.json(summary);
});



// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});

// Presigned URL endpoint for frontend uploads
app.post('/api/upload-url', async (req, res) => {
  try {
    const { filename, folder = 'general', contentType = 'application/octet-stream' } = req.body || {};
    if (!filename) return res.status(400).json({ message: 'filename is required' });

    const bucket = process.env.S3_BUCKET_NAME;
    const region = process.env.AWS_REGION || 'ap-south-1';

    const key = `${folder}/${Date.now()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 900 }); // 15 minutes

    const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    return res.json({ url, key, publicUrl });
  } catch (err) {
    console.error('Error generating presigned URL', err);
    return res.status(500).json({ message: 'Failed to generate upload URL', error: err.message });
  }
});
