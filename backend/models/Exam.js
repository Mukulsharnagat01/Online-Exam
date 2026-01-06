import { v4 as uuidv4 } from 'uuid';

export class Exam {
  constructor(data) {
    this.examId = data.examId || `EXAM-${uuidv4()}`;
    this.subject = data.subject; // e.g., 'python', 'react-js'
    this.title = data.title;
    this.description = data.description;
    this.examType = data.examType; // 'mcq', 'coding', 'theory'
    this.duration = data.duration; // in minutes
    this.totalQuestions = data.totalQuestions;
    this.totalMarks = data.totalMarks;
    this.scheduledStart = data.scheduledStart;
    this.scheduledEnd = data.scheduledEnd;
    this.status = data.status || 'draft'; // 'draft', 'active', 'completed'
    this.createdBy = data.createdBy;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.questions = data.questions || []; // Array of question IDs
    this.isPublished = data.isPublished || false;
  }

  toDynamoDBItem() {
    return {
      PK: `EXAM#${this.examId}`,
      SK: `METADATA#${this.examId}`,
      GSI1PK: `SUBJECT#${this.subject}`,
      GSI1SK: `EXAM#${this.status}`,
      ...this,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}