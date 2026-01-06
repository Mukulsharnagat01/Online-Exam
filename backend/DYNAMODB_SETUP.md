# DynamoDB Setup Guide - Data Storage with userId

Yeh document batata hai ki kaise DynamoDB me data store hota hai student ki userId ke saath.

## 📊 Tables Structure

### 1. **Exams Table**
- **Primary Key**: `examId`
- **Fields with userId**:
  - `createdBy`: Admin ki userId (jo exam create karta hai)
- **Storage**: ✅ Already implemented in `exam.controller.js`

```javascript
const examItem = {
  examId,
  subject,
  duration,
  totalMarks,
  createdBy: req.user.userId, // ✅ Admin userId stored
  createdAt: new Date().toISOString(),
  status: 'draft'
};
```

### 2. **ExamSubmissions Table**
- **Primary Key**: `submissionId`
- **GSI**: `userId-index` (for querying by userId)
- **Fields with userId**:
  - `userId`: Student ki userId (jo exam submit karta hai)
  - `userName`: Student ka naam
- **Storage**: ✅ Already implemented in `submission.controller.js`

```javascript
const submission = {
  submissionId,
  examId,
  userId: req.user.userId, // ✅ Student userId stored
  userName: req.user.name,
  answers,
  mcqScore,
  status: 'submitted',
  submittedAt: new Date().toISOString()
};
```

### 3. **Results Table**
- **Primary Key**: `resultId`
- **GSI**: `userId-index` (for querying by userId)
- **Fields with userId**:
  - `userId`: Student ki userId (jiska result hai)
  - `userName`: Student ka naam
  - `evaluatedBy`: Admin ki userId (jo evaluate karta hai)
- **Storage**: ✅ Already implemented in `submission.controller.js` (evaluateSubmission)

```javascript
const resultItem = {
  resultId,
  submissionId,
  examId,
  userId: subRes.Item.userId, // ✅ Student userId stored
  userName: subRes.Item.userName,
  obtainedMarks,
  totalMarks,
  percentage,
  status: 'published',
  evaluatedAt: new Date().toISOString(),
  evaluatedBy: req.user.userId // ✅ Admin userId stored
};
```

## 🔧 Setup Steps

### Step 1: Create Tables
```bash
cd backend
node scripts/setupAWSTables.js
```

Yeh script create karegi:
- Exams table
- ExamSubmissions table
- Results table

### Step 2: Add Global Secondary Indexes (GSI)
```bash
node scripts/addGSI.js
```

Yeh script add karegi GSIs:
- `ExamSubmissions.userId-index` - Query submissions by userId
- `ExamSubmissions.examId-index` - Query submissions by examId
- `Results.userId-index` - Query results by userId
- `Results.examId-index` - Query results by examId

### Step 3: Verify Setup
```bash
node testDynamoDB.js
```

## 📝 API Endpoints

### Exams (Created by Admin)
- `POST /api/exams` - Create exam (stores `createdBy: userId`)
- `GET /api/exams` - Get all exams
- `GET /api/exams/:examId` - Get exam by ID

### Submissions (By Student userId)
- `POST /api/submissions/submit-exam` - Submit exam (stores `userId: req.user.userId`)
- `GET /api/submissions/my-submissions` - Get student's submissions (queries by userId using GSI)
- `GET /api/submissions/admin/submissions` - Get all submissions (admin only)

### Results (By Student userId)
- `POST /api/submissions/admin/evaluate/:submissionId` - Evaluate submission (stores result with `userId`)
- `GET /api/submissions/my-results` - Get student's results (queries by userId using GSI)

## 🔍 Querying by userId

### Get Student's Submissions
```javascript
// Uses userId-index GSI
const result = await ddb.send(new QueryCommand({
  TableName: 'ExamSubmissions',
  IndexName: 'userId-index',
  KeyConditionExpression: 'userId = :uid',
  ExpressionAttributeValues: { ':uid': req.user.userId }
}));
```

### Get Student's Results
```javascript
// Uses userId-index GSI
const result = await ddb.send(new QueryCommand({
  TableName: 'Results',
  IndexName: 'userId-index',
  KeyConditionExpression: 'userId = :uid',
  ExpressionAttributeValues: { ':uid': req.user.userId }
}));
```

## ✅ Summary

- ✅ **Exams**: Store with `createdBy` (admin userId)
- ✅ **Submissions**: Store with `userId` (student userId)
- ✅ **Results**: Store with `userId` (student userId) and `evaluatedBy` (admin userId)
- ✅ **GSIs**: Added for efficient querying by userId
- ✅ **API Endpoints**: All endpoints properly store and query by userId

Sab data properly DynamoDB me store hota hai student ki userId ke saath! 🎉

