// // Simple in-memory store for development/testing
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
export const getExamById = (examId) => {
  if (!examId) return null;

  const candidates = new Set();
  const idStr = String(examId);
  candidates.add(idStr);

  // If examId has EXAM- prefix, also try without it; if it doesn't, also try with prefix
  if (/^EXAM-/i.test(idStr)) {
    candidates.add(idStr.replace(/^EXAM-/i, ''));
  } else {
    candidates.add(`EXAM-${idStr}`);
  }

  // Try exact and case-insensitive matches against stored examId or id
  for (const e of exams) {
    const ids = [e.examId, e.id].filter(Boolean);
    for (const stored of ids) {
      for (const cand of candidates) {
        if (stored === cand) return e;
        if (stored.toLowerCase() === cand.toLowerCase()) return e;
      }
    }
  }

  return null;
};
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
  addExam,
  deleteExam
};

// const submissions = [];
// const results = [];
// const exams = [];

// export const getSubmissions = () => submissions;
// export const addSubmission = (sub) => submissions.push(sub);
// export const updateSubmission = (submissionId, patch) => {
//   const idx = submissions.findIndex(s => (s.submissionId || s.id) === submissionId);
//   if (idx === -1) return null;
//   submissions[idx] = { ...submissions[idx], ...patch };
//   return submissions[idx];
// };

// export const addResult = (resItem) => results.push(resItem);
// export const getResults = () => results;

// // Exams helpers
// export const getExams = () => exams;
// export const getExamById = (examId) => exams.find(e => e.examId === examId || e.id === examId) || null;
// export const addExam = (exam) => {
//   // if exam with id exists, update
//   const existing = getExamById(exam.examId || exam.id);
//   if (existing) {
//     Object.assign(existing, exam);
//     return existing;
//   }
//   exams.push(exam);
//   return exam;
// };

// export const deleteExam = (examId) => {
//   const idx = exams.findIndex(e => e.examId === examId || e.id === examId);
//   if (idx === -1) return false;
//   exams.splice(idx, 1);
//   return true;
// };

// export default {
//   submissions,
//   results,
//   exams,
//   getSubmissions,
//   addSubmission,
//   updateSubmission,
//   addResult,
//   getResults,
//   getExams,
//   getExamById,
//   addExam
//   ,deleteExam
// };
