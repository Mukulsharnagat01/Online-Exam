import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CreateExam = () => {
  const [examData, setExamData] = useState({
    subject: '',
    duration: 60, // minutes
    totalMarks: 100
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!examData.subject || examData.duration <= 0 || examData.totalMarks <= 0) {
      toast.error('All fields required');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/exams', examData);
      toast.success('Exam created! Now add questions');
      navigate(`/admin/questions/${res.data.examId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-8">Create New Exam</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">Subject</label>
            <input
              type="text"
              value={examData.subject}
              onChange={(e) => setExamData({...examData, subject: e.target.value})}
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">Duration (minutes)</label>
            <input
              type="number"
              value={examData.duration}
              onChange={(e) => setExamData({...examData, duration: +e.target.value})}
              className="w-full p-3 border rounded-lg"
              min="1"
              required
            />
          </div>
          <div className="mb-8">
            <label className="block text-lg font-medium mb-2">Total Marks</label>
            <input
              type="number"
              value={examData.totalMarks}
              onChange={(e) => setExamData({...examData, totalMarks: +e.target.value})}
              className="w-full p-3 border rounded-lg"
              min="1"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 text-xl font-bold"
          >
            {loading ? 'Creating...' : 'Create Exam'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateExam;