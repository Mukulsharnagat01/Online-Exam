import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ManageExams = () => {
  const [exams, setExams] = useState([]);

  useEffect(() => {
    api.get('/exams')
      .then(res => setExams(res.data))
      .catch(() => toast.error('Failed to load exams'));
  }, []);

  const handleDelete = async (examId) => {
    const ok = window.confirm('Are you sure you want to delete this exam? This cannot be undone.');
    if (!ok) return;
    try {
      const res = await adminAPI.deleteExam(examId);
      if (res && (res.success === false || res.message && res.message.toLowerCase().includes('failed'))) {
        toast.error(res.message || 'Delete failed');
        return;
      }
      // remove from UI
      setExams(prev => prev.filter(e => e.examId !== examId));
      toast.success('Exam deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete exam');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-10">
        <h1 className="text-4xl font-bold mb-8 text-indigo-800">Manage Exams</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {exams.map(exam => (
            <div key={exam.examId} className="relative bg-indigo-100 rounded-xl p-6 hover:bg-indigo-200 transition-all">
              <Link to={`/admin/questions/${exam.examId}`} className="block">
                <h3 className="text-2xl font-bold text-indigo-700">{exam.subject}</h3>
                <p className="text-gray-600">Duration: {exam.duration} min | Marks: {exam.totalMarks}</p>
                <p className="text-sm text-gray-500">Questions: {exam.questions?.length || 0}</p>
              </Link>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(exam.examId); }}
                className="absolute top-4 right-4 text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
        {exams.length === 0 && <p className="text-center text-gray-500 mt-8">No exams yet</p>}
      </div>
    </div>
  );
};

export default ManageExams;