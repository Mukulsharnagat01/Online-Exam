import { v4 as uuidv4 } from 'uuid';

export class Submission {
  constructor(data) {
    this.submissionId = data.submissionId || `SUB-${uuidv4()}`;
    this.examId = data.examId;
    this.studentId = data.studentId;
    this.studentName = data.studentName;
    this.subject = data.subject;
    this.examType = data.examType;
    this.answers = data.answers || [];
    this.startTime = data.startTime;
    this.endTime = data.endTime;
    this.timeSpent = data.timeSpent; // in seconds
    this.totalQuestions = data.totalQuestions;
    this.attemptedQuestions = data.attemptedQuestions;
    this.status = data.status || 'submitted'; // 'submitted', 'evaluated', 'published'
    this.submittedAt = data.submittedAt || new Date().toISOString();
    this.ipAddress = data.ipAddress;
    this.deviceInfo = data.deviceInfo;
    this.s3AnswerSheetUrl = data.s3AnswerSheetUrl; // For theory/coding answers in S3
  }

  toDynamoDBItem() {
    return {
      PK: `SUBMISSION#${this.submissionId}`,
      SK: `EXAM#${this.examId}`,
      GSI1PK: `STUDENT#${this.studentId}`,
      GSI1SK: `EXAM#${this.examId}`,
      GSI2PK: `EXAM#${this.examId}`,
      GSI2SK: `SUBMISSION#${this.submittedAt}`,
      ...this
    };
  }
}