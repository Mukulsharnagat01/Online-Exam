import { ddb } from '../config/dynamo.js';
import { PutCommand, QueryCommand, ScanCommand, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import inMemoryStore from '../db/inMemoryStore.js';

const SUB_TABLE = process.env.DYNAMODB_SUBMISSIONS_TABLE || 'ExamSubmissions';
const RES_TABLE = process.env.DYNAMODB_RESULTS_TABLE || 'Results';



// added extra
// Add this helper function at the top (after imports)
const getExamDetails = async (examId) => {
  try {
    const EXAM_TABLE = process.env.DYNAMODB_EXAMS_TABLE || 'Exams';
    const examRes = await ddb.send(new GetCommand({ 
      TableName: EXAM_TABLE, 
      Key: { examId } 
    }));
    
    if (examRes.Item) {
      return {
        examName: examRes.Item.title || examRes.Item.examName || `Exam ${examId}`,
        subject: examRes.Item.subject || 'General',
        examType: examRes.Item.examType || 'MCQ'
      };
    }
  } catch (err) {
    console.warn(`Failed to fetch exam ${examId}:`, err.message);
  }
  
  return {
    examName: `Exam ${examId}`,
    subject: 'General',
    examType: 'MCQ'
  };
};
// added exit

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

// export const getAllSubmissions = async (req, res) => {
//   try {
//     const result = await ddb.send(new ScanCommand({ TableName: SUB_TABLE }));
//     res.json({
//   success: true,
//   submissions: result.Items || []
// });

//   } catch (err) {
//     res.status(500).json({ message: 'Failed' });
//   }
// };
// Function 1: getAllSubmissions
export const getAllSubmissions = async (req, res) => {
  try {
    console.log('🔍 Fetching from DynamoDB Table:', SUB_TABLE);
    
    // ✅ सिर्फ़ DynamoDB से data लाएँ
    const result = await ddb.send(new ScanCommand({ 
      TableName: SUB_TABLE,
      Limit: 100  // Optional: limit add करें
    }));
    
    const submissions = result.Items || [];
    
    console.log('✅ DynamoDB में मिले submissions:', submissions.length);
    
    // ✅ सिर्फ़ DynamoDB data return करें
    res.json({
      success: true,
      submissions: submissions,  // ✅ यह line important है
      count: submissions.length
    });

  } catch (err) {
    console.error('❌ DynamoDB Error:', err);
    
    // Fallback में भी inMemoryStore का नाम check करें
    const memorySubs = inMemoryStore.getSubmissions ? inMemoryStore.getSubmissions() : [];
    
    res.json({
      success: true,
      submissions: memorySubs,
      count: memorySubs.length,
      source: 'in-memory-fallback'
    });
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
    res.json({
  success: true,
  submissions: result.Items || []
});

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






// export const getMyResults = async (req, res) => {
//   try {
//     const EXAM_TABLE = process.env.DYNAMODB_EXAMS_TABLE || 'Exams';
    
//     // 1) Fetch published results for the user
//     let published = [];
//     try {
//       const result = await ddb.send(new QueryCommand({
//         TableName: RES_TABLE,
//         IndexName: 'userId-index',
//         KeyConditionExpression: 'userId = :uid',
//         ExpressionAttributeValues: { ':uid': req.user.userId }
//       }));
//       published = result.Items || [];
      
//       // Get exam details for each result
//       published = await Promise.all(published.map(async (result) => {
//         try {
//           const examRes = await ddb.send(new GetCommand({ 
//             TableName: EXAM_TABLE, 
//             Key: { examId: result.examId } 
//           }));
          
//           return {
//             ...result,
//             examName: examRes?.Item?.title || examRes?.Item?.examName || `Exam ${result.examId}`,
//             subject: examRes?.Item?.subject || 'General',
//             examType: examRes?.Item?.examType || 'MCQ'
//           };
//         } catch (examErr) {
//           console.warn(`Failed to fetch exam ${result.examId}:`, examErr.message);
//           return {
//             ...result,
//             examName: `Exam ${result.examId}`,
//             subject: 'General',
//             examType: 'Unknown'
//           };
//         }
//       }));


// // Get results by userId (student's results)
// export const getMyResults = async (req, res) => {
//   try {
//     // 1) Fetch published results for the user
//     let published = [];
//     try {
//       const result = await ddb.send(new QueryCommand({
//         TableName: RES_TABLE,
//         IndexName: 'userId-index', // GSI for querying by userId
//         KeyConditionExpression: 'userId = :uid',
//         ExpressionAttributeValues: { ':uid': req.user.userId }
//       }));
//       published = result.Items || [];
//     } catch (err) {
//       console.warn('Querying Results table failed, falling back to scan or in-memory', err?.message || err);
      // try scan fallback
    //   try {
    //     const scanRes = await ddb.send(new ScanCommand({
    //       TableName: RES_TABLE,
    //       FilterExpression: 'userId = :uid',
    //       ExpressionAttributeValues: { ':uid': req.user.userId }
    //     }));
    //     published = scanRes.Items || [];
    //   } catch (scanErr) {
    //     console.warn('Scan Results failed, using in-memory fallback', scanErr?.message || scanErr);
    //     const all = inMemoryStore.getResults();
    //     published = all.filter(r => r.userId === req.user.userId);
    //   }
    // }

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
    // } catch (err) {
    //   console.warn('Querying Submissions table failed, falling back to in-memory', err?.message || err);
    //   const allSubs = inMemoryStore.getSubmissions();
    //   pending = allSubs.filter(s => (s.userId === req.user.userId) && (s.status === 'submitted'));
    // }
 try {
          const examRes = await ddb.send(new GetCommand({ 
            TableName: EXAM_TABLE, 
            Key: { examId: submission.examId } 
          }));
          
          return {
            ...submission,
            examName: examRes?.Item?.title || examRes?.Item?.examName || `Exam ${submission.examId}`,
            subject: examRes?.Item?.subject || 'General',
            examType: examRes?.Item?.examType || 'MCQ',
            status: 'pending' // Normalize status
          };
        } catch (examErr) {
          console.warn(`Failed to fetch exam ${submission.examId}:`, examErr.message);
          return {
            ...submission,
            examName: `Exam ${submission.examId}`,
            subject: 'General',
            examType: 'Unknown',
            status: 'pending'
          };
        }
      }));
    } catch (err) {
      console.warn('Querying Submissions table failed:', err.message);
    }


      

    // Return combined array: published results first, then pending submissions
//     return res.json([...(published || []), ...(pending || [])]);
//   } catch (err) {
//     console.error('Get my results error:', err);
//     // Fallback to Scan if GSI doesn't exist
//     try {
//       const scanResult = await ddb.send(new ScanCommand({
//         TableName: RES_TABLE,
//         FilterExpression: 'userId = :uid',
//         ExpressionAttributeValues: { ':uid': req.user.userId }
//       }));
//       res.json(scanResult.Items || []);
//     } catch (scanErr) {
//       // Final fallback: in-memory results (dev)
//       try {
//         const all = inMemoryStore.getResults();
//         const filtered = all.filter(r => r.userId === req.user.userId);
//         return res.json(filtered);
//       } catch (memErr) {
//         console.error('In-memory results fallback failed', memErr?.message || memErr);
//         res.status(500).json({ message: 'Failed to fetch results' });
//       }
//     }
//   }
// };


// Updated getMyResults function (REPLACE the entire function)
export const getMyResults = async (req, res) => {
  try {
    // 1) Fetch published results for the user
    let published = [];
    try {
      const result = await ddb.send(new QueryCommand({
        TableName: RES_TABLE,
        IndexName: 'userId-index',
        KeyConditionExpression: 'userId = :uid',
        ExpressionAttributeValues: { ':uid': req.user.userId }
      }));
      published = result.Items || [];
      
      // Get exam details for each result
      for (let i = 0; i < published.length; i++) {
        const examDetails = await getExamDetails(published[i].examId);
        published[i] = {
          ...published[i],
          ...examDetails,
          status: 'published'
        };
      }
    } catch (err) {
      console.warn('Querying Results table failed:', err.message);
      // Fallback to scan
      try {
        const scanRes = await ddb.send(new ScanCommand({
          TableName: RES_TABLE,
          FilterExpression: 'userId = :uid',
          ExpressionAttributeValues: { ':uid': req.user.userId }
        }));
        published = scanRes.Items || [];
        
        // Get exam details for scan results too
        for (let i = 0; i < published.length; i++) {
          const examDetails = await getExamDetails(published[i].examId);
          published[i] = {
            ...published[i],
            ...examDetails,
            status: 'published'
          };
        }
      } catch (scanErr) {
        console.warn('Scan Results failed:', scanErr.message);
        // Fallback to in-memory
        const all = inMemoryStore.getResults ? inMemoryStore.getResults() : [];
        published = all.filter(r => r.userId === req.user.userId);
      }
    }

    // 2) Fetch pending submissions
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
      
      // Get exam details for each pending submission
      for (let i = 0; i < pending.length; i++) {
        const examDetails = await getExamDetails(pending[i].examId);
        pending[i] = {
          ...pending[i],
          ...examDetails,
          status: 'pending'
        };
      }
    } catch (err) {
      console.warn('Querying Submissions table failed:', err.message);
      // Fallback to in-memory
      const allSubs = inMemoryStore.getSubmissions ? inMemoryStore.getSubmissions() : [];
      pending = allSubs.filter(s => (s.userId === req.user.userId) && (s.status === 'submitted'));
    }

    // Return combined array
    return res.json([...published, ...pending]);
  } catch (err) {
    console.error('Get my results error:', err);
    
    // Final fallback
    try {
      const scanResult = await ddb.send(new ScanCommand({
        TableName: RES_TABLE,
        FilterExpression: 'userId = :uid',
        ExpressionAttributeValues: { ':uid': req.user.userId }
      }));
      res.json(scanResult.Items || []);
    } catch (scanErr) {
      // In-memory fallback
      try {
        const all = inMemoryStore.getResults ? inMemoryStore.getResults() : [];
        const filtered = all.filter(r => r.userId === req.user.userId);
        res.json(filtered);
      } catch (memErr) {
        console.error('All fallbacks failed:', memErr.message);
        res.status(500).json({ 
          message: 'Failed to fetch results',
          error: err.message 
        });
      }
    }
  }
};


    // Return combined array with normalized data
    return res.json([...published, ...pending]);
  } catch (err) {
    console.error('Get my results error:', err);
    res.status(500).json({ message: 'Failed to fetch results' });
  }
};
