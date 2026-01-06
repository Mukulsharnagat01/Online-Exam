// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import Navbar from '../components/Navbar';
// import axios from 'axios';
// import toast from 'react-hot-toast';

// const ExamSelection = () => {
//     const [subjects, setSubjects] = useState([]);

//     // useEffect(() => {
//     //     const stored = localStorage.getItem('examSubjects');
//     //     if (stored) {
//     //         setSubjects(JSON.parse(stored));
//     //     } else {
//     //         setSubjects(['mcq', 'theory', 'coding']);
//     //     }
//     // }, []);
//  useEffect(() => {
//   axios.get('/api/exams', { withCredentials: true })
//     .then(res => setExams(res.data))
//     .catch(() => toast.error('Failed to load exams'));
// }, []);
//     return (
//         <div className="min-h-screen bg-gray-100">
//             <Navbar />
//             <div className="container mx-auto p-8 text-center">
//                 <h1 className="text-4xl font-bold mb-8">Choose Exam Subject</h1>
//                 <p className="text-lg text-gray-600 mb-12">Select a subject to start the exam</p>

//                 {subjects.length === 0 ? (
//                     <p className="text-xl text-gray-500">No subjects available. Ask admin to add subjects.</p>
//                 ) : (
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
//              {/* // Exams list ke andar
// <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"> */}
//   {exams.map(exam => (
//     <Link
//       key={exam.examId}
//       to={`/exam/${exam.examId}`}
//       className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300"
//     >
//       <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-32 flex items-center justify-center">
//         <h3 className="text-3xl font-bold text-white">{exam.subject}</h3>
//       </div>
//       <div className="p-8 text-center">
//         <p className="text-xl text-gray-700 mb-4">{exam.duration} minutes • {exam.totalMarks} marks</p>
//         <span className="inline-block bg-green-600 text-white px-8 py-3 rounded-full font-bold hover:bg-green-700">
//           Start Exam →
//         </span>
//       </div>
//     </Link>
//   ))}
// </div>
//                 )}

//                 <div className="mt-12">
//                     <Link to="/" className="px-8 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
//                         ← Back to Home
//                     </Link>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ExamSelection;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const ExamSelection = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get('/exams');
        console.log('API Response:', res.data); // ← YE IMPORTANT – console me dekhna

        // ✅ Safe check: agar array nahi to empty array set kar do
        if (Array.isArray(res.data)) {
          setExams(res.data);
        } else {
          console.warn('Exams data is not an array:', res.data);
          setExams([]); // empty array to avoid crash
          toast.error('No exams found or invalid data');
        }
      } catch (err) {
        console.error('Fetch exams error:', err.response || err);
        toast.error('Failed to load exams');
        if (err.response?.status === 401) {
          navigate('/login');
        }
        setExams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-2xl text-indigo-800">Loading exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="container mx-auto p-8">
        <h1 className="text-5xl font-extrabold text-center mb-12 text-indigo-800">
          Available Exams
        </h1>

        {exams.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-2xl max-w-2xl mx-auto">
            <p className="text-3xl text-gray-600 mb-4">📭 No exams available yet</p>
            <p className="text-xl text-gray-500">Admin se exam create karwayein</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
            {exams.map((exam) => (
              <Link
                key={exam.examId}
                to={`/exam/${exam.examId}`}
                className="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 hover:shadow-3xl transition-all duration-300 border border-indigo-100"
              >
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-center">
                  <h3 className="text-3xl font-bold text-white">{exam.subject || 'Untitled Exam'}</h3>
                </div>
                <div className="p-8 text-center">
                  <p className="text-2xl text-gray-700 mb-3">⏱ {exam.duration} minutes</p>
                  <p className="text-2xl text-gray-700 mb-4">📊 {exam.totalMarks} marks</p>
                  <p className="text-lg text-gray-500 mb-8">
                    Questions: {exam.questions?.length || 0}
                  </p>
                  <span className="inline-block bg-green-600 text-white px-12 py-5 rounded-full text-xl font-bold hover:bg-green-700 shadow-lg">
                    Start Exam →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamSelection;