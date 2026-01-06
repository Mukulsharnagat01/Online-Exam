// import { ddb } from "../config/dynamo.js";
// import { PutCommand, GetCommand, ScanCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
// import { v4 as uuid } from "uuid";
// import { Exam } from '../models/Exam.js';
// // import { PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

// export const createExam = async (req, res) => {
//   try {
//     const examId = uuid();
//     const exam = {
//       examId,
//       title: req.body.title,
//       description: req.body.description || '',
//       subject: req.body.subject,
//       examType: req.body.examType, // 'mcq', 'coding', 'theory'
//       duration: req.body.duration || 60, // minutes
//       totalMarks: req.body.totalMarks || 100,
//       totalQuestions: req.body.totalQuestions || 10,
//       passingMarks: req.body.passingMarks || 40,
//       scheduledStart: req.body.scheduledStart || new Date().toISOString(),
//       status: req.body.status || 'active',
//       createdBy: req.user.userId,
//       createdAt: Date.now()
//     };

//     await ddb.send(
//       new PutCommand({
//         TableName: "Exams",
//         Item: exam
//       })
//     );

//     res.status(201).json({
//       success: true,
//       message: "Exam created successfully",
//       exam
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const getAllExams = async (req, res) => {
//   try {
//     const data = await ddb.send(
//       new ScanCommand({
//         TableName: "Exams"
//       })
//     );

//     res.json({
//       success: true,
//       exams: data.Items || []
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const getExamsByType = async (req, res) => {
//   try {
//     const { type } = req.params;
    
//     const data = await ddb.send(
//       new ScanCommand({
//         TableName: "Exams",
//         FilterExpression: "examType = :type",
//         ExpressionAttributeValues: {
//           ":type": type
//         }
//       })
//     );

//     res.json({
//       success: true,
//       exams: data.Items || []
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const getActiveExams = async (req, res) => {
//   try {
//     const data = await ddb.send(
//       new ScanCommand({
//         TableName: "Exams",
//         FilterExpression: "status = :stat",
//         ExpressionAttributeValues: {
//           ":stat": "active"
//         }
//       })
//     );

//     res.json({
//       success: true,
//       exams: data.Items || []
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const getExamById = async (req, res) => {
//   try {
//     const { examId } = req.params;
    
//     const data = await ddb.send(
//       new GetCommand({
//         TableName: "Exams",
//         Key: { examId }
//       })
//     );

//     if (!data.Item) {
//       return res.status(404).json({
//         success: false,
//         message: "Exam not found"
//       });
//     }

//     res.json({
//       success: true,
//       exam: data.Item
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const updateExam = async (req, res) => {
//   try {
//     const { examId } = req.params;
    
//     // Check if exam exists
//     const existing = await ddb.send(
//       new GetCommand({
//         TableName: "Exams",
//         Key: { examId }
//       })
//     );

//     if (!existing.Item) {
//       return res.status(404).json({
//         success: false,
//         message: "Exam not found"
//       });
//     }

//     // Update exam
//     const updateExpression = [];
//     const expressionValues = {};
//     const expressionNames = {};

//     Object.keys(req.body).forEach(key => {
//       if (key !== 'examId') {
//         updateExpression.push(`#${key} = :${key}`);
//         expressionNames[`#${key}`] = key;
//         expressionValues[`:${key}`] = req.body[key];
//       }
//     });

//     await ddb.send(
//       new UpdateCommand({
//         TableName: "Exams",
//         Key: { examId },
//         UpdateExpression: `SET ${updateExpression.join(', ')}`,
//         ExpressionAttributeNames: expressionNames,
//         ExpressionAttributeValues: expressionValues
//       })
//     );

//     res.json({
//       success: true,
//       message: "Exam updated successfully"
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const deleteExam = async (req, res) => {
//   try {
//     const { examId } = req.params;
    
//     await ddb.send(
//       new DeleteCommand({
//         TableName: "Exams",
//         Key: { examId }
//       })
//     );

//     res.json({
//       success: true,
//       message: "Exam deleted successfully"
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


import { ddb } from '../config/dynamo.js';
import { PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import inMemoryStore from '../db/inMemoryStore.js';

const TABLE = process.env.DYNAMODB_EXAMS_TABLE || 'Exams';

export const createExam = async (req, res) => {
  try {
    const { subject, duration, totalMarks } = req.body;
    if (!subject || !duration || !totalMarks) return res.status(400).json({ message: 'Missing fields' });

    const examId = `EXAM-${uuidv4()}`;
    const examItem = {
      examId,
      subject,
      duration: Number(duration),
      totalMarks: Number(totalMarks),
      questions: [], // array of question objects
      createdBy: req.user.userId,
      createdAt: new Date().toISOString(),
      status: 'draft'
    };

    await ddb.send(new PutCommand({ TableName: TABLE, Item: examItem }));
    res.status(201).json({ examId, message: 'Exam created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllExams = async (req, res) => {
  try {
    const result = await ddb.send(new ScanCommand({ TableName: TABLE }));
    res.json(result.Items || []);
  } catch (err) {
    // Fallback to in-memory exams for development when Dynamo fails
    console.warn('Dynamo scan failed, falling back to in-memory exams', err?.message || err);
    return res.json(inMemoryStore.getExams());
  }
};

export const getExamById = async (req, res) => {
  try {
    const { examId } = req.params;
    const result = await ddb.send(new GetCommand({
      TableName: TABLE,
      Key: { examId }
    }));
    if (!result.Item) return res.status(404).json({ message: 'Exam not found' });
    res.json(result.Item);
  } catch (err) {
    // If Dynamo lookup fails or exam not found in Dynamo, check in-memory store
    console.warn('Dynamo get failed for exam, checking in-memory store', err?.message || err);
    const { examId } = req.params;
    const local = inMemoryStore.getExamById(examId);
    if (local) return res.json(local);
    return res.status(500).json({ message: 'Failed' });
  }
};

// Add question to exam
export const addQuestion = async (req, res) => {
  try {
    const { examId } = req.params;
    const questionData = req.body;
    const questionId = `Q-${uuidv4()}`;

    const question = {
      questionId,
      ...questionData, // type, questionText, options, correctAnswer, marks
      createdAt: new Date().toISOString()
    };

    // Get current exam
    const examRes = await ddb.send(new GetCommand({ TableName: TABLE, Key: { examId } }));
    if (!examRes.Item) return res.status(404).json({ message: 'Exam not found' });

    const updatedQuestions = [...(examRes.Item.questions || []), question];

    await ddb.send(new UpdateCommand({
      TableName: TABLE,
      Key: { examId },
      UpdateExpression: 'SET questions = :q',
      ExpressionAttributeValues: { ':q': updatedQuestions }
    }));

    res.json({ message: 'Question added', question });
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
};

// Get questions for exam
export const getQuestionsByExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const examRes = await ddb.send(new GetCommand({ TableName: TABLE, Key: { examId } }));
    if (!examRes.Item) return res.status(404).json({ message: 'Not found' });

    // Hide correctAnswer for non-admin
    const questions = (examRes.Item.questions || []).map(q => {
      if (req.user.role !== 'admin') {
        const { correctAnswer, ...safeQ } = q;
        return safeQ;
      }
      return q;
    });

    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
};

// Delete question
export const deleteQuestion = async (req, res) => {
  try {
    const { examId, questionId } = req.params;
    const examRes = await ddb.send(new GetCommand({ TableName: TABLE, Key: { examId } }));
    if (!examRes.Item) return res.status(404).json({ message: 'Exam not found' });

    const filtered = examRes.Item.questions.filter(q => q.questionId !== questionId);

    await ddb.send(new UpdateCommand({
      TableName: TABLE,
      Key: { examId },
      UpdateExpression: 'SET questions = :q',
      ExpressionAttributeValues: { ':q': filtered }
    }));

    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
};

// Delete whole exam (admin only)
export const deleteExam = async (req, res) => {
  try {
    const { examId } = req.params;
    // Try deleting from DynamoDB
    await ddb.send(new DeleteCommand({ TableName: TABLE, Key: { examId } }));
    return res.json({ message: 'Exam deleted' });
  } catch (err) {
    console.warn('Delete exam failed on Dynamo, trying in-memory fallback', err?.message || err);
    // Fallback to in-memory store
    try {
      const deleted = inMemoryStore.deleteExam(req.params.examId);
      if (deleted) return res.json({ message: 'Exam deleted (in-memory)' });
      return res.status(404).json({ message: 'Exam not found' });
    } catch (e) {
      console.error('Failed to delete exam:', e);
      return res.status(500).json({ message: 'Failed to delete exam' });
    }
  }
};