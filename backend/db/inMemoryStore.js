// Simple in-memory store for development/testing
const submissions = [];
const results = [];
const exams = [];

export const getSubmissions = () => submissions;
export const addSubmission = (sub) => submissions.push(sub);
export const updateSubmission = (submissionId, patch) => {
  const idx = submissions.findIndex(s => (s.submissionId || s.id) === submissionId);
  if (idx === -1) return null;
  submissions[idx] = { ...submissions[idx], ...patch };
  return submissions[idx];
};

export const addResult = (resItem) => results.push(resItem);
export const getResults = () => results;

// Exams helpers
export const getExams = () => exams;
export const getExamById = (examId) => exams.find(e => e.examId === examId || e.id === examId) || null;
export const addExam = (exam) => {
  // if exam with id exists, update
  const existing = getExamById(exam.examId || exam.id);
  if (existing) {
    Object.assign(existing, exam);
    return existing;
  }
  exams.push(exam);
  return exam;
};

export const deleteExam = (examId) => {
  const idx = exams.findIndex(e => e.examId === examId || e.id === examId);
  if (idx === -1) return false;
  exams.splice(idx, 1);
  return true;
};

export default {
  submissions,
  results,
  exams,
  getSubmissions,
  addSubmission,
  updateSubmission,
  addResult,
  getResults,
  getExams,
  getExamById,
  addExam
  ,deleteExam
};
