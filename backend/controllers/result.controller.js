import { ddb } from "../config/dynamo.js";
import { PutCommand, GetCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuid } from "uuid";
import { s3Client, BUCKET_NAME } from '../config/awsConfig.js';

export const submitExam = async (req, res) => {
  try {
    const submissionId = uuid();
    const { examId, answers, timeTaken } = req.body;

    // Get exam details
    const examData = await ddb.send(
      new GetCommand({
        TableName: "Exams",
        Key: { examId }
      })
    );

    if (!examData.Item) {
      return res.status(404).json({
        success: false,
        message: "Exam not found"
      });
    }

    const submission = {
      submissionId,
      examId,
      userId: req.user.userId,
      userName: req.user.name,
      userEmail: req.user.email,
      answers: answers || [],
      submittedAt: Date.now(),
      timeTaken: timeTaken || 0,
      status: "submitted",
      evaluatedBy: null,
      evaluatedAt: null,
      totalMarksObtained: 0,
      percentage: 0,
      isPassed: false
    };

    await ddb.send(
      new PutCommand({
        TableName: "ExamSubmissions",
        Item: submission
      })
    );

    res.status(201).json({
      success: true,
      message: "Exam submitted successfully",
      submissionId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMySubmissions = async (req, res) => {
  try {
    const data = await ddb.send(
      new ScanCommand({
        TableName: "ExamSubmissions",
        FilterExpression: "userId = :uid",
        ExpressionAttributeValues: {
          ":uid": req.user.userId
        }
      })
    );

    res.json({
      success: true,
      submissions: data.Items || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSubmissionById = async (req, res) => {
  try {
    const { submissionId } = req.params;
    
    const data = await ddb.send(
      new GetCommand({
        TableName: "ExamSubmissions",
        Key: { submissionId }
      })
    );

    if (!data.Item) {
      return res.status(404).json({
        success: false,
        message: "Submission not found"
      });
    }

    // Check permission
    if (data.Item.userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    res.json({
      success: true,
      submission: data.Item
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getExamResults = async (req, res) => {
  try {
    const { examId } = req.params;
    
    const data = await ddb.send(
      new ScanCommand({
        TableName: "ExamSubmissions",
        FilterExpression: "examId = :eid",
        ExpressionAttributeValues: {
          ":eid": examId
        }
      })
    );

    res.json({
      success: true,
      submissions: data.Items || [],
      count: data.Items?.length || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const evaluateSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { marks, feedback } = req.body;

    // Get submission
    const submissionData = await ddb.send(
      new GetCommand({
        TableName: "ExamSubmissions",
        Key: { submissionId }
      })
    );

    if (!submissionData.Item) {
      return res.status(404).json({
        success: false,
        message: "Submission not found"
      });
    }

    // Get exam for passing criteria
    const examData = await ddb.send(
      new GetCommand({
        TableName: "Exams",
        Key: { examId: submissionData.Item.examId }
      })
    );

    const totalMarksObtained = marks || 0;
    const percentage = examData.Item.totalMarks > 0 
      ? (totalMarksObtained / examData.Item.totalMarks) * 100 
      : 0;
    const isPassed = percentage >= examData.Item.passingMarks;

    await ddb.send(
      new UpdateCommand({
        TableName: "ExamSubmissions",
        Key: { submissionId },
        UpdateExpression: "SET totalMarksObtained = :tmo, percentage = :perc, isPassed = :pass, status = :stat, evaluatedBy = :evalBy, evaluatedAt = :evalAt, feedback = :fb",
        ExpressionAttributeValues: {
          ":tmo": totalMarksObtained,
          ":perc": percentage,
          ":pass": isPassed,
          ":stat": "evaluated",
          ":evalBy": req.user.userId,
          ":evalAt": Date.now(),
          ":fb": feedback || ""
        }
      })
    );

    res.json({
      success: true,
      message: "Submission evaluated successfully",
      totalMarksObtained,
      percentage,
      isPassed
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};