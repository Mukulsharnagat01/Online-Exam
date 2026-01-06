// import React, { useState, useEffect } from 'react';
// import Navbar from '../../components/Navbar';
// import { Link } from 'react-router-dom';

// const AdminDashboard = () => {
//     const [subjects, setSubjects] = useState([]);

//     useEffect(() => {
//         const stored = localStorage.getItem('examSubjects');
//         if (stored) {
//             setSubjects(JSON.parse(stored));
//         } else {
//             // Default fallback
//             setSubjects(['mcq', 'theory', 'coding']);
//         }
//     }, []);

//     return (
//         <div className="min-h-screen bg-gray-100">
//             <Navbar />
//             <div className="container mx-auto p-8">
//                 <h1 className="text-4xl font-bold mb-10 text-gray-800 text-center">Admin Dashboard</h1>

//                 {/* Fixed Links */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
//                     <Link to="/admin-subjects" className="bg-linear-to-br from-indigo-600 to-purple-700 text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all">
//                         <h2 className="text-2xl font-bold mb-4">Manage Subjects</h2>
//                         <p className="text-lg">Add or remove exam subjects</p>
//                     </Link>

//                     <Link to="/admin-submissions" className="bg-linear-to-br from-red-600 to-pink-700 text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all">
//                         <h2 className="text-2xl font-bold mb-4">View Submissions</h2>
//                         <p className="text-lg">Check all student answers</p>
//                     </Link>
//                 </div>

//                 {/* Dynamic Subject Question Management Cards */}
//                 <h2 className="text-3xl font-bold mb-8 text-gray-800">Manage Questions by Subject</h2>
                
//                 {subjects.length === 0 ? (
//                     <div className="text-center py-12 bg-white rounded-xl shadow-lg">
//                         <p className="text-xl text-gray-600">No subjects available yet.</p>
//                         <Link to="/admin-subjects" className="mt-6 inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
//                             Add Subjects First
//                         </Link>
//                     </div>
//                 ) : (
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//                         {subjects.map((sub) => (
//                             <Link
//                                 key={sub}
//                                 to={`/admin-questions/${sub}`}
//                                 className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-200"
//                             >
//                                 <h2 className="text-2xl font-bold mb-4 text-blue-700 capitalize">
//                                     {sub.replace(/-/g, ' ')}
//                                 </h2>
//                                 <p className="text-gray-600 text-lg">
//                                     Add, edit, or delete questions for this subject
//                                 </p>
//                             </Link>
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default AdminDashboard;



import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="container mx-auto p-8">
        <h1 className="text-5xl font-extrabold text-center mb-12 text-indigo-800">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <Link
            to="/admin/create-exam"
            className="bg-white rounded-2xl shadow-2xl p-10 text-center transform hover:scale-105 hover:shadow-3xl transition-all duration-300 border border-indigo-200"
          >
            <div className="text-6xl mb-6 text-green-600">➕</div>
            <h2 className="text-3xl font-bold text-indigo-700 mb-4">Create New Exam</h2>
            <p className="text-gray-600 text-lg">Mixed MCQ, Theory & Coding Questions</p>
          </Link>

          <Link
            to="/admin/exams" // ya direct exams list if you have
            className="bg-white rounded-2xl shadow-2xl p-10 text-center transform hover:scale-105 hover:shadow-3xl transition-all duration-300 border border-blue-200"
          >
            <div className="text-6xl mb-6 text-blue-600">📝</div>
            <h2 className="text-3xl font-bold text-indigo-700 mb-4">Manage Exams</h2>
            <p className="text-gray-600 text-lg">Add/Edit Questions</p>
          </Link>

          <Link
            to="/admin-submissions"
            className="bg-white rounded-2xl shadow-2xl p-10 text-center transform hover:scale-105 hover:shadow-3xl transition-all duration-300 border border-purple-200"
          >
            <div className="text-6xl mb-6 text-purple-600">✅</div>
            <h2 className="text-3xl font-bold text-indigo-700 mb-4">Check Submissions</h2>
            <p className="text-gray-600 text-lg">Evaluate & Publish Results</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;