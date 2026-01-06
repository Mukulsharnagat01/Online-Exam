// import { ddb } from "../config/dynamo.js";
// import { ScanCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
// import { v4 as uuid } from "uuid";

// export const getQuestions = async (req, res) => {
//   const { subject } = req.query;

//   const data = await ddb.send(
//     new ScanCommand({
//       TableName: "Questions",
//       FilterExpression: "subject = :s",
//       ExpressionAttributeValues: { ":s": subject }
//     })
//   );

//   res.json(data.Items || []);
// };

// export const addQuestion = async (req, res) => {
//   const item = {
//     id: uuid(),
//     subject: req.body.subject,
//     type: req.body.type,
//     question: req.body.question,
//     options: req.body.options || [],
//     createdBy: req.user.userId, // 👈 MongoDB userId
//     createdAt: Date.now()
//   };

//   await ddb.send(
//     new PutCommand({
//       TableName: "Questions",
//       Item: item
//     })
//   );

//   res.json(item);
// };

// export const deleteQuestion = async (req, res) => {
//   await ddb.send(
//     new DeleteCommand({
//       TableName: "Questions",
//       Key: { id: req.params.id }
//     })
//   );

//   res.json({ success: true });


import { ddb } from "../config/dynamo.js";
import {
  PutCommand,
  QueryCommand,
  DeleteCommand
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuid } from "uuid";



/**
 * ✅ Get all questions for ONE exam
 */
export const getQuestionsByExam = async (req, res) => {
  try {
    const { examId } = req.params;

    const data = await ddb.send(
      new QueryCommand({
        TableName: "Questions",
        KeyConditionExpression: "examId = :eid",
        ExpressionAttributeValues: {
          ":eid": examId
        }
      })
    );

    res.json({
      success: true,
      questions: data.Items || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Add question to exam
 */
export const addQuestion = async (req, res) => {
  try {
    const { examId } = req.params;
    const {
      question,
      type,
      options = [],
      correctAnswer,
      marks = 5,
      difficulty = "medium"
    } = req.body;

    const item = {
      examId,
      questionId: uuid(),
      question,
      type,
      options,
      correctAnswer,
      marks,
      difficulty,
      createdBy: req.user.userId,
      createdAt: Date.now()
    };

    await ddb.send(
      new PutCommand({
        TableName: "Questions",
        Item: item
      })
    );

    res.status(201).json({
      success: true,
      message: "Question added successfully",
      question: item
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Delete question
 */
export const deleteQuestion = async (req, res) => {
  try {
    const { examId, questionId } = req.params;

    await ddb.send(
      new DeleteCommand({
        TableName: "Questions",
        Key: {
          examId,
          questionId
        }
      })
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
 