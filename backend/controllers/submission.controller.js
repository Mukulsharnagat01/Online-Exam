import { ddb } from '../config/dynamo.js';
import { PutCommand, QueryCommand, ScanCommand, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import inMemoryStore from '../db/inMemoryStore.js';

const SUB_TABLE = process.env.DYNAMODB_SUBMISSIONS_TABLE || 'ExamSubmissions';
const RES_TABLE = process.env.DYNAMODB_RESULTS_TABLE || 'Results';

export const submitExam = async (req, res) => {
  try {
    const { examId, answers, mcqScore = 0 } = req.body;
    const submissionId = `SUB-${uuidv4()}`;

    const submission = {
      submissionId,
      examId,
      userId: req.user.userId,
      userName: req.user.name,
      answers, // { questionId: answer }
      mcqScore,
      status: 'submitted',
      submittedAt: new Date().toISOString()
    };

    await ddb.send(new PutCommand({ TableName: SUB_TABLE, Item: submission }));
    res.json({ message: 'Submitted successfully', mcqScore });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Submit failed' });
  }
};

export const getAllSubmissions = async (req, res) => {
  try {
    const result = await ddb.send(new ScanCommand({ TableName: SUB_TABLE }));
    res.json(result.Items || []);
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
};

export const getMySubmissions = async (req, res) => {
  try {
    const result = await ddb.send(new QueryCommand({
      TableName: SUB_TABLE,
      IndexName: 'userId-index', // GSI
      KeyConditionExpression: 'userId = :uid',
      ExpressionAttributeValues: { ':uid': req.user.userId }
    }));
    res.json(result.Items || []);
  } catch (err) {
    res.status(500).json({ message: 'Failed' });
  }
};

// Admin: Evaluate submission
export const evaluateSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { obtainedMarks } = req.body; // admin sends total marks after checking

    // Try DynamoDB first
    let subItem = null;
    let subFromDynamo = null;
    try {
      const subRes = await ddb.send(new GetCommand({ TableName: SUB_TABLE, Key: { submissionId } }));
      subFromDynamo = subRes.Item || null;
      if (subFromDynamo) subItem = subFromDynamo;
    } catch (err) {
      console.warn('DynamoDB get submission failed, will try in-memory fallback', err?.message || err);
    }

    // If we didn't find in Dynamo, try in-memory store (dev fallback)
    if (!subItem) {
      try {
        const found = inMemoryStore.getSubmissions().find(s => (s.submissionId || s.id) === submissionId);
        if (found) subItem = found;
      } catch (imErr) {
        console.warn('In-memory fallback failed', imErr?.message || imErr);
      }
    }

    if (!subItem) return res.status(404).json({ message: 'Submission not found' });

    // Get exam to fetch totalMarks (Dynamo or fallback)
    let totalMarks = 100;
    try {
      const EXAM_TABLE = process.env.DYNAMODB_EXAMS_TABLE || 'Exams';
      const examRes = await ddb.send(new GetCommand({ TableName: EXAM_TABLE, Key: { examId: subItem.examId } }));
      if (examRes?.Item) {
        totalMarks = Number(examRes.Item.totalMarks) || 100;
      } else {
        const localExam = inMemoryStore.getExamById(subItem.examId);
        totalMarks = localExam?.totalMarks || subItem.totalMarks || 100;
      }
    } catch (err) {
      console.warn('DynamoDB get exam failed, checking in-memory or using defaults', err?.message || err);
      const localExam = inMemoryStore.getExamById(subItem.examId);
      totalMarks = localExam?.totalMarks || subItem.totalMarks || 100;
    }

    const percentage = totalMarks > 0 ? ((Number(obtainedMarks) / totalMarks) * 100).toFixed(2) : '0.00';

    const resultItem = {
      resultId: `RES-${uuidv4()}`,
      submissionId,
      examId: subItem.examId,
      userId: subItem.userId || subItem.id,
      userName: subItem.userName || subItem.studentName || subItem.userName || 'Unknown',
      obtainedMarks: Number(obtainedMarks),
      totalMarks: Number(totalMarks),
      percentage: parseFloat(percentage),
      status: 'published',
      evaluatedAt: new Date().toISOString(),
      evaluatedBy: req.user.userId // Admin userId who evaluated
    };

    // Try to write to DynamoDB Results table; if it fails, fallback to in-memory
    let wroteToDynamo = false;
    try {
      await ddb.send(new PutCommand({ TableName: RES_TABLE, Item: resultItem }));
      wroteToDynamo = true;
    } catch (err) {
      console.warn('DynamoDB put result failed, storing in-memory', err?.message || err);
      try {
        inMemoryStore.addResult(resultItem);
      } catch (imErr) {
        console.error('Failed to store result in-memory', imErr?.message || imErr);
      }
    }

    // Update submission status: try Dynamo then in-memory
    try {
      if (subFromDynamo) {
        await ddb.send(new UpdateCommand({ TableName: SUB_TABLE, Key: { submissionId }, UpdateExpression: 'SET #s = :s', ExpressionAttributeNames: { '#s': 'status' }, ExpressionAttributeValues: { ':s': 'evaluated' } }));
      } else {
        // update in-memory
        inMemoryStore.updateSubmission(submissionId, { status: 'evaluated' });
      }
    } catch (err) {
      console.error('Failed to update submission status in Dynamo or in-memory', err?.message || err);
    }

    res.json({ message: 'Result published', result: resultItem });
  } catch (err) {
    console.error('Evaluate submission error:', err);
    res.status(500).json({ message: 'Failed' });
  }
};

// Get results by userId (student's results)
export const getMyResults = async (req, res) => {
  try {
    // 1) Fetch published results for the user
    let published = [];
    try {
      const result = await ddb.send(new QueryCommand({
        TableName: RES_TABLE,
        IndexName: 'userId-index', // GSI for querying by userId
        KeyConditionExpression: 'userId = :uid',
        ExpressionAttributeValues: { ':uid': req.user.userId }
      }));
      published = result.Items || [];
    } catch (err) {
      console.warn('Querying Results table failed, falling back to scan or in-memory', err?.message || err);
      // try scan fallback
      try {
        const scanRes = await ddb.send(new ScanCommand({
          TableName: RES_TABLE,
          FilterExpression: 'userId = :uid',
          ExpressionAttributeValues: { ':uid': req.user.userId }
        }));
        published = scanRes.Items || [];
      } catch (scanErr) {
        console.warn('Scan Results failed, using in-memory fallback', scanErr?.message || scanErr);
        const all = inMemoryStore.getResults();
        published = all.filter(r => r.userId === req.user.userId);
      }
    }

    // 2) Fetch submissions for the user that are still pending (status = 'submitted')
    let pending = [];
    try {
      const subRes = await ddb.send(new QueryCommand({
        TableName: SUB_TABLE,
        IndexName: 'userId-index',
        KeyConditionExpression: 'userId = :uid',
        ExpressionAttributeValues: { ':uid': req.user.userId }
      }));
      const items = subRes.Items || [];
      pending = items.filter(s => s.status === 'submitted');
    } catch (err) {
      console.warn('Querying Submissions table failed, falling back to in-memory', err?.message || err);
      const allSubs = inMemoryStore.getSubmissions();
      pending = allSubs.filter(s => (s.userId === req.user.userId) && (s.status === 'submitted'));
    }

    // Return combined array: published results first, then pending submissions
    return res.json([...(published || []), ...(pending || [])]);
  } catch (err) {
    console.error('Get my results error:', err);
    // Fallback to Scan if GSI doesn't exist
    try {
      const scanResult = await ddb.send(new ScanCommand({
        TableName: RES_TABLE,
        FilterExpression: 'userId = :uid',
        ExpressionAttributeValues: { ':uid': req.user.userId }
      }));
      res.json(scanResult.Items || []);
    } catch (scanErr) {
      // Final fallback: in-memory results (dev)
      try {
        const all = inMemoryStore.getResults();
        const filtered = all.filter(r => r.userId === req.user.userId);
        return res.json(filtered);
      } catch (memErr) {
        console.error('In-memory results fallback failed', memErr?.message || memErr);
        res.status(500).json({ message: 'Failed to fetch results' });
      }
    }
  }
};