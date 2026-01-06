export const getStudentDashboard = (req, res) => {
  res.json({
    message: "Student dashboard data"
  });
};

export const getUpcomingExams = (req, res) => {
  res.json({
    message: "Upcoming exams list"
  });
};

export const getCompletedExams = (req, res) => {
  res.json({
    message: "Completed exams list"
  });
};

export const getStudentProfile = (req, res) => {
  res.json({
    message: "Student profile data",
    user: req.user || null
  });
};
