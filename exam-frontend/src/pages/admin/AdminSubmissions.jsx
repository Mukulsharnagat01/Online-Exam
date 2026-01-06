import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api, { submissionsAPI } from '../../services/api';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext.jsx';

const AdminSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [examDetails, setExamDetails] = useState({}); // Cache for exam details
  const [scoreInput, setScoreInput] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchSubmissions();
  }, []);




  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      console.log('Fetching submissions...');

      const response = await submissionsAPI.getAdminSubmissions();
      console.log('Submissions response:', response);

      let submissionsData = [];
      if (response && response.success && Array.isArray(response.submissions)) {
        submissionsData = response.submissions;
      } else if (Array.isArray(response)) {
        submissionsData = response;
      } else if (response && Array.isArray(response.data)) {
        submissionsData = response.data;
      } else {
        console.error('Invalid response format:', response);
        toast.error(response?.message || 'Invalid data format received');
        submissionsData = [];
      }

      setSubmissions(submissionsData);
      
      // Fetch exam details for each unique examId
      const uniqueExamIds = [...new Set(submissionsData.map(sub => sub.examId).filter(Boolean))];
      const examDetailsMap = {};
      
      await Promise.all(
        uniqueExamIds.map(async (examId) => {
          try {
            const examRes = await api.get(`/exams/${examId}`);
            examDetailsMap[examId] = examRes.data;
          } catch (err) {
            console.error(`Failed to fetch exam ${examId}:`, err);
            examDetailsMap[examId] = { subject: 'Unknown Exam' };
          }
        })
      );
      
      setExamDetails(examDetailsMap);
      
    } catch (error) {
      console.error('Error fetching submissions:', error);
      
      if (error.response?.status === 401) {
        toast.error('Unauthorized. Please login as admin.');
      } else if (error.response?.status === 403) {
        toast.error('Only admin can view submissions.');
      } else if (error.response?.status === 404) {
        toast.error('Submissions endpoint not found.');
      } else {
        toast.error('Failed to load submissions.');
      }
      
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const viewSubmission = (submission) => {
    setSelectedSubmission(submission);
  };

  const closeModal = () => {
    setSelectedSubmission(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading submissions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Check Submissions
            </h1>
            <p className="text-gray-600">
              View all submitted exams from students
            </p>
          </div>

          {/* Refresh Button */}
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={fetchSubmissions}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
            >
              🔄 Refresh
            </button>
            <span className="text-gray-700 font-medium">
              Total Submissions: <span className="text-blue-600 font-bold">{submissions.length}</span>
            </span>
          </div>

          {/* Submissions Table */}
          {submissions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-gray-400 mb-6">
                <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No submissions found
              </h3>
              <p className="text-gray-500">
                Students haven't submitted any exams yet.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-blue-600 to-indigo-600">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Submission ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Exam/Subject
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        MCQ Score
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Submitted At
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {submissions.map((sub) => {
                      const exam = examDetails[sub.examId] || {};
                      const answerCount = sub.answers ? Object.keys(sub.answers).length : 0;
                      return (
                        <tr key={sub.submissionId || sub.id} className="hover:bg-blue-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">
                              {sub.submissionId || sub.id}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-800 font-medium">
                              {sub.userName || sub.studentName || 'Anonymous'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              <div className="font-semibold text-gray-900">
                                {exam.subject || exam.title || sub.examId || 'Unknown Exam'}
                              </div>
                              <div className="text-gray-500 text-xs">
                                {answerCount} question{answerCount !== 1 ? 's' : ''} answered
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                              {sub.mcqScore !== undefined ? sub.mcqScore : 'N/A'} marks
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {sub.submittedAt 
                              ? new Date(sub.submittedAt).toLocaleString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : sub.timestamp
                              ? new Date(sub.timestamp).toLocaleString()
                              : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              sub.status === 'submitted' || sub.status === 'evaluated'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {sub.status || 'submitted'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => viewSubmission(sub)}
                              className="text-blue-600 hover:text-blue-900 font-medium hover:underline transition-colors"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Submission Detail Modal */}
          {selectedSubmission && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={closeModal}>
              <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 md:p-8">
                  <div className="flex justify-between items-start mb-6 border-b pb-4">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                        Submission Details
                      </h2>
                      <p className="text-gray-600">
                        ID: {selectedSubmission.submissionId || selectedSubmission.id}
                      </p>
                    </div>
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-600 text-3xl font-light leading-none"
                    >
                      ×
                    </button>
                  </div>

                  {/* Student and Exam Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Student Information
                      </h3>
                      <p className="text-gray-700 mb-2">
                        <strong>Name:</strong> {selectedSubmission.userName || selectedSubmission.studentName || 'Anonymous'}
                      </p>
                      <p className="text-gray-700">
                        <strong>User ID:</strong> {selectedSubmission.userId || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Exam Information
                      </h3>
                      <p className="text-gray-700 mb-2">
                        <strong>Exam:</strong> {examDetails[selectedSubmission.examId]?.subject || examDetails[selectedSubmission.examId]?.title || selectedSubmission.examId || 'Unknown'}
                      </p>
                      <p className="text-gray-700 mb-2">
                        <strong>Exam ID:</strong> {selectedSubmission.examId || 'N/A'}
                      </p>
                      <p className="text-gray-700">
                        <strong>MCQ Score:</strong> <span className="font-bold text-green-600">{selectedSubmission.mcqScore !== undefined ? selectedSubmission.mcqScore : 'N/A'}</span> marks
                      </p>
                    </div>
                  </div>

                  {/* Submission Details */}
                  <div className="bg-gray-50 p-6 rounded-xl mb-8 border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Submission Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Submitted At</p>
                        <p className="font-semibold text-gray-800">
                          {selectedSubmission.submittedAt 
                            ? new Date(selectedSubmission.submittedAt).toLocaleString()
                            : selectedSubmission.timestamp
                            ? new Date(selectedSubmission.timestamp).toLocaleString()
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <p className="font-semibold text-gray-800 capitalize">{selectedSubmission.status || 'submitted'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Answers</p>
                        <p className="font-semibold text-gray-800">
                          {selectedSubmission.answers ? Object.keys(selectedSubmission.answers).length : 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Answers Section */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Student Answers
                    </h3>
                    {selectedSubmission.answers && Object.keys(selectedSubmission.answers).length > 0 ? (
                      <div className="space-y-4">
                        {Object.entries(selectedSubmission.answers).map(([questionId, answer], index) => (
                          <div key={questionId} className="border-2 border-gray-200 rounded-xl p-6 bg-white hover:border-blue-300 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-bold text-gray-800 text-lg">
                                Question {index + 1}
                              </h4>
                              <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                ID: {questionId}
                              </span>
                            </div>
                            <div className="mt-4">
                              <p className="text-gray-700 whitespace-pre-wrap break-words bg-gray-50 p-4 rounded-lg border border-gray-200">
                                {answer && answer.toString().trim() ? answer.toString() : <em className="text-gray-400">No answer provided</em>}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                        <p className="text-gray-500">No answers available for this submission</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex justify-end border-t pt-6">
                    {user?.role === 'admin' && (
                      <div className="mr-4 flex items-center gap-3">
                        <input
                          type="number"
                          min="0"
                          value={scoreInput}
                          onChange={(e) => setScoreInput(e.target.value)}
                          placeholder="Enter marks"
                          className="px-3 py-2 border rounded-lg w-32"
                        />
                        <button
                          onClick={async () => {
                            if (!scoreInput || isNaN(Number(scoreInput))) {
                              toast.error('Please enter valid marks');
                              return;
                            }
                            try {
                              const id = selectedSubmission.submissionId || selectedSubmission.id;
                              const resp = await submissionsAPI.evaluateSubmission(id, Number(scoreInput));
                              if (resp && (resp.success || resp.message || resp.result)) {
                                toast.success(resp.message || 'Result published');
                                // Update UI
                                setSelectedSubmission(prev => prev ? { ...prev, status: 'evaluated', totalMarksObtained: Number(scoreInput) } : prev);
                                // Refresh list
                                fetchSubmissions();
                                setScoreInput('');
                              } else {
                                toast.error(resp?.message || 'Failed to publish result');
                              }
                            } catch (err) {
                              console.error('Evaluate error:', err);
                              toast.error('Failed to publish result');
                            }
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
                        >
                          Publish Score
                        </button>
                      </div>
                    )}
                    <button
                      onClick={closeModal}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSubmissions;
