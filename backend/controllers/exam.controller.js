


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
    if (result && result.Item) {
      return res.json(result.Item);
    }

    // No item in Dynamo -> try in-memory fallback (development)
    const local = inMemoryStore.getExamById(examId);
    if (local) return res.json(local);

    return res.status(404).json({ message: 'Exam not found' });
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
    let examItem = examRes?.Item;
    if (!examItem) {
      // Try in-memory fallback before returning 404
      examItem = inMemoryStore.getExamById(examId);
      if (!examItem) return res.status(404).json({ message: 'Not found' });
    }

    // Hide correctAnswer for non-admin
    const questions = (examItem.questions || []).map(q => {
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

// import { ddb } from '../config/dynamo.js';
// import { PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
// import { v4 as uuidv4 } from 'uuid';
// import inMemoryStore from '../db/inMemoryStore.js';

// const TABLE = process.env.DYNAMODB_EXAMS_TABLE || 'Exams';

// export const createExam = async (req, res) => {
//   try {
//     const { subject, duration, totalMarks } = req.body;
//     if (!subject || !duration || !totalMarks) return res.status(400).json({ message: 'Missing fields' });

//     const examId = `EXAM-${uuidv4()}`;
//     const examItem = {
//       examId,
//       subject,
//       duration: Number(duration),
//       totalMarks: Number(totalMarks),
//       questions: [], // array of question objects
//       createdBy: req.user.userId,
//       createdAt: new Date().toISOString(),
//       status: 'draft'
//     };

//     await ddb.send(new PutCommand({ TableName: TABLE, Item: examItem }));
//     res.status(201).json({ examId, message: 'Exam created' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// export const getAllExams = async (req, res) => {
//   try {
//     const result = await ddb.send(new ScanCommand({ TableName: TABLE }));
//     res.json(result.Items || []);
//   } catch (err) {
//     // Fallback to in-memory exams for development when Dynamo fails
//     console.warn('Dynamo scan failed, falling back to in-memory exams', err?.message || err);
//     return res.json(inMemoryStore.getExams());
//   }
// };

// export const getExamById = async (req, res) => {
//   try {
//     const { examId } = req.params;
//     const result = await ddb.send(new GetCommand({
//       TableName: TABLE,
//       Key: { examId }
//     }));
//     if (result && result.Item) {
//       return res.json(result.Item);
//     }

//     // No item in Dynamo -> try in-memory fallback (development)
//     const local = inMemoryStore.getExamById(examId);
//     if (local) return res.json(local);

//     return res.status(404).json({ message: 'Exam not found' });
//   } catch (err) {
//     // If Dynamo lookup fails or exam not found in Dynamo, check in-memory store
//     console.warn('Dynamo get failed for exam, checking in-memory store', err?.message || err);
//     const { examId } = req.params;
//     const local = inMemoryStore.getExamById(examId);
//     if (local) return res.json(local);
//     return res.status(500).json({ message: 'Failed' });
//   }
// };

// // Add question to exam
// export const addQuestion = async (req, res) => {
//   try {
//     const { examId } = req.params;
//     const questionData = req.body;
//     const questionId = `Q-${uuidv4()}`;

//     const question = {
//       questionId,
//       ...questionData, // type, questionText, options, correctAnswer, marks
//       createdAt: new Date().toISOString()
//     };

//     // Get current exam
//     const examRes = await ddb.send(new GetCommand({ TableName: TABLE, Key: { examId } }));
//     if (!examRes.Item) return res.status(404).json({ message: 'Exam not found' });

//     const updatedQuestions = [...(examRes.Item.questions || []), question];

//     await ddb.send(new UpdateCommand({
//       TableName: TABLE,
//       Key: { examId },
//       UpdateExpression: 'SET questions = :q',
//       ExpressionAttributeValues: { ':q': updatedQuestions }
//     }));

//     res.json({ message: 'Question added', question });
//   } catch (err) {
//     res.status(500).json({ message: 'Failed' });
//   }
// };

// // Get questions for exam
// export const getQuestionsByExam = async (req, res) => {
//   try {
//     const { examId } = req.params;
//     const examRes = await ddb.send(new GetCommand({ TableName: TABLE, Key: { examId } }));
//     let examItem = examRes?.Item;
//     if (!examItem) {
//       // Try in-memory fallback before returning 404
//       examItem = inMemoryStore.getExamById(examId);
//       if (!examItem) return res.status(404).json({ message: 'Not found' });
//     }

//     // Hide correctAnswer for non-admin
//     const questions = (examItem.questions || []).map(q => {
//       if (req.user.role !== 'admin') {
//         const { correctAnswer, ...safeQ } = q;
//         return safeQ;
//       }
//       return q;
//     });

//     res.json(questions);
//   } catch (err) {
//     res.status(500).json({ message: 'Failed' });
//   }
// };

// // Delete question
// export const deleteQuestion = async (req, res) => {
//   try {
//     const { examId, questionId } = req.params;
//     const examRes = await ddb.send(new GetCommand({ TableName: TABLE, Key: { examId } }));
//     if (!examRes.Item) return res.status(404).json({ message: 'Exam not found' });

//     const filtered = examRes.Item.questions.filter(q => q.questionId !== questionId);

//     await ddb.send(new UpdateCommand({
//       TableName: TABLE,
//       Key: { examId },
//       UpdateExpression: 'SET questions = :q',
//       ExpressionAttributeValues: { ':q': filtered }
//     }));

//     res.json({ message: 'Deleted' });
//   } catch (err) {
//     res.status(500).json({ message: 'Failed' });
//   }
// };

// // Delete whole exam (admin only)
// export const deleteExam = async (req, res) => {
//   try {
//     const { examId } = req.params;
//     // Try deleting from DynamoDB
//     await ddb.send(new DeleteCommand({ TableName: TABLE, Key: { examId } }));
//     return res.json({ message: 'Exam deleted' });
//   } catch (err) {
//     console.warn('Delete exam failed on Dynamo, trying in-memory fallback', err?.message || err);
//     // Fallback to in-memory store
//     try {
//       const deleted = inMemoryStore.deleteExam(req.params.examId);
//       if (deleted) return res.json({ message: 'Exam deleted (in-memory)' });
//       return res.status(404).json({ message: 'Exam not found' });
//     } catch (e) {
//       console.error('Failed to delete exam:', e);
//       return res.status(500).json({ message: 'Failed to delete exam' });
//     }
//   }
// };

// // import { ddb } from '../config/dynamo.js';
// // import { PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
// // import { v4 as uuidv4 } from 'uuid';
// // import inMemoryStore from '../db/inMemoryStore.js';

// // const TABLE = process.env.DYNAMODB_EXAMS_TABLE || 'Exams';

// // export const createExam = async (req, res) => {
// //   try {
// //     const { subject, duration, totalMarks } = req.body;
// //     if (!subject || !duration || !totalMarks) return res.status(400).json({ message: 'Missing fields' });

// //     const examId = `EXAM-${uuidv4()}`;
// //     const examItem = {
// //       examId,
// //       subject,
// //       duration: Number(duration),
// //       totalMarks: Number(totalMarks),
// //       questions: [], // array of question objects
// //       createdBy: req.user.userId,
// //       createdAt: new Date().toISOString(),
// //       status: 'draft'
// //     };

// //     await ddb.send(new PutCommand({ TableName: TABLE, Item: examItem }));
// //     res.status(201).json({ examId, message: 'Exam created' });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ message: 'Server error' });
// //   }
// // };

// // export const getAllExams = async (req, res) => {
// //   try {
// //     const result = await ddb.send(new ScanCommand({ TableName: TABLE }));
// //     res.json(result.Items || []);
// //   } catch (err) {
// //     // Fallback to in-memory exams for development when Dynamo fails
// //     console.warn('Dynamo scan failed, falling back to in-memory exams', err?.message || err);
// //     return res.json(inMemoryStore.getExams());
// //   }
// // };

// // export const getExamById = async (req, res) => {
// //   try {
// //     const { examId } = req.params;
// //     const result = await ddb.send(new GetCommand({
// //       TableName: TABLE,
// //       Key: { examId }
// //     }));
// //     if (!result.Item) return res.status(404).json({ message: 'Exam not found' });
// //     res.json(result.Item);
// //   } catch (err) {
// //     // If Dynamo lookup fails or exam not found in Dynamo, check in-memory store
// //     console.warn('Dynamo get failed for exam, checking in-memory store', err?.message || err);
// //     const { examId } = req.params;
// //     const local = inMemoryStore.getExamById(examId);
// //     if (local) return res.json(local);
// //     return res.status(500).json({ message: 'Failed' });
// //   }
// // };

// // // Add question to exam
// // export const addQuestion = async (req, res) => {
// //   try {
// //     const { examId } = req.params;
// //     const questionData = req.body;
// //     const questionId = `Q-${uuidv4()}`;

// //     const question = {
// //       questionId,
// //       ...questionData, // type, questionText, options, correctAnswer, marks
// //       createdAt: new Date().toISOString()
// //     };

// //     // Get current exam
// //     const examRes = await ddb.send(new GetCommand({ TableName: TABLE, Key: { examId } }));
// //     if (!examRes.Item) return res.status(404).json({ message: 'Exam not found' });

// //     const updatedQuestions = [...(examRes.Item.questions || []), question];

// //     await ddb.send(new UpdateCommand({
// //       TableName: TABLE,
// //       Key: { examId },
// //       UpdateExpression: 'SET questions = :q',
// //       ExpressionAttributeValues: { ':q': updatedQuestions }
// //     }));

// //     res.json({ message: 'Question added', question });
// //   } catch (err) {
// //     res.status(500).json({ message: 'Failed' });
// //   }
// // };

// // // Get questions for exam
// // export const getQuestionsByExam = async (req, res) => {
// //   try {
// //     const { examId } = req.params;
// //     const examRes = await ddb.send(new GetCommand({ TableName: TABLE, Key: { examId } }));
// //     if (!examRes.Item) return res.status(404).json({ message: 'Not found' });

// //     // Hide correctAnswer for non-admin
// //     const questions = (examRes.Item.questions || []).map(q => {
// //       if (req.user.role !== 'admin') {
// //         const { correctAnswer, ...safeQ } = q;
// //         return safeQ;
// //       }
// //       return q;
// //     });

// //     res.json(questions);
// //   } catch (err) {
// //     res.status(500).json({ message: 'Failed' });
// //   }
// // };

// // // Delete question
// // export const deleteQuestion = async (req, res) => {
// //   try {
// //     const { examId, questionId } = req.params;
// //     const examRes = await ddb.send(new GetCommand({ TableName: TABLE, Key: { examId } }));
// //     if (!examRes.Item) return res.status(404).json({ message: 'Exam not found' });

// //     const filtered = examRes.Item.questions.filter(q => q.questionId !== questionId);

// //     await ddb.send(new UpdateCommand({
// //       TableName: TABLE,
// //       Key: { examId },
// //       UpdateExpression: 'SET questions = :q',
// //       ExpressionAttributeValues: { ':q': filtered }
// //     }));

// //     res.json({ message: 'Deleted' });
// //   } catch (err) {
// //     res.status(500).json({ message: 'Failed' });
// //   }
// // };

// // // Delete whole exam (admin only)
// // export const deleteExam = async (req, res) => {
// //   try {
// //     const { examId } = req.params;
// //     // Try deleting from DynamoDB
// //     await ddb.send(new DeleteCommand({ TableName: TABLE, Key: { examId } }));
// //     return res.json({ message: 'Exam deleted' });
// //   } catch (err) {
// //     console.warn('Delete exam failed on Dynamo, trying in-memory fallback', err?.message || err);
// //     // Fallback to in-memory store
// //     try {
// //       const deleted = inMemoryStore.deleteExam(req.params.examId);
// //       if (deleted) return res.json({ message: 'Exam deleted (in-memory)' });
// //       return res.status(404).json({ message: 'Exam not found' });
// //     } catch (e) {
// //       console.error('Failed to delete exam:', e);
// //       return res.status(500).json({ message: 'Failed to delete exam' });
// //     }
// //   }
// // };
