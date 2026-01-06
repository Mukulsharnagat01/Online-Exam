import { v4 as uuidv4 } from 'uuid';

export class Question {
  constructor(data) {
    this.questionId = data.questionId || `Q-${uuidv4()}`;
    this.examId = data.examId;
    this.subject = data.subject;
    this.questionType = data.questionType; // 'mcq', 'coding', 'theory'
    this.questionText = data.questionText;
    this.options = data.options || []; // For MCQ
    this.correctAnswer = data.correctAnswer; // For MCQ
    this.answer = data.answer; // For theory
    this.testCases = data.testCases || []; // For coding
    this.expectedOutput = data.expectedOutput; // For coding
    this.marks = data.marks || 1;
    this.difficulty = data.difficulty || 'medium';
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  toDynamoDBItem() {
    return {
      PK: `QUESTION#${this.questionId}`,
      SK: `EXAM#${this.examId}`,
      GSI1PK: `EXAM#${this.examId}`,
      GSI1SK: `QUESTION#${this.questionType}`,
      ...this
    };
  }
}