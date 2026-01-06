


// import React, { useState, useEffect } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import Navbar from '../../components/Navbar';

// const DynamicQuestionManager = () => {
//     const { subject } = useParams();
//     const [questions, setQuestions] = useState([]);
//     const [newQuestion, setNewQuestion] = useState('');
//     const [options, setOptions] = useState(['', '', '', '']);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');

//     useEffect(() => {
//         const fetchQuestions = async () => {
//             try {
//                 setLoading(true);
//                 setError('');
                
//                 // ✅ Fix: Use authToken instead of token
//                 const token = localStorage.getItem('authToken') || 
//                               localStorage.getItem('token');
                
//                 if (!token) {
//                     throw new Error('No authentication token found');
//                 }

//                 console.log('Fetching questions for:', subject, 'with token:', token.substring(0, 10) + '...');
                
//                 const response = await fetch(`http://localhost:3000/api/questions/${subject}`, {
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                         'Content-Type': 'application/json'
//                     }
//                 });
                
//                 if (!response.ok) {
//                     if (response.status === 401) {
//                         throw new Error('Unauthorized. Please login again.');
//                     }
//                     throw new Error(`Failed to fetch: ${response.status}`);
//                 }
                
//                 const data = await response.json();
//                 console.log('API Response:', data);
                
//                 // ✅ Handle response format - adjust based on your backend
//                 // if (data.success && data.questions) {
//                 //     setQuestions(data.questions);
//                 // } else if (Array.isArray(data)) {
//                 //     setQuestions(data);
//                 // } else if (data.data && Array.isArray(data.data)) {
//                 //     setQuestions(data.data);
//                 // } else {
//                 //     setQuestions([]);
//                 // }
//     // ✅ FIX: Always ensure array
//                 let questionsArray = [];
                
//                 if (Array.isArray(data)) {
//                     questionsArray = data;
//                 } else if (data.success && Array.isArray(data.questions)) {
//                     questionsArray = data.questions;
//                 } else if (data.questions && Array.isArray(data.questions)) {
//                     questionsArray = data.questions;
//                 } else if (data.data && Array.isArray(data.data)) {
//                     questionsArray = data.data;
//                 }
                
//                 // ✅ FIX: Clean and validate each question
//                 const cleanedQuestions = questionsArray.map(q => {
//                     // Ensure each question has required fields
//                     return {
//                         id: q.id || q._id || Date.now() + Math.random(),
//                         question: typeof q.question === 'string' ? q.question : 
//                                  typeof q.text === 'string' ? q.text :
//                                  typeof q.title === 'string' ? q.title :
//                                  typeof q === 'string' ? q : 'Question text not found',
//                         options: Array.isArray(q.options) ? q.options : 
//                                 Array.isArray(q.choices) ? q.choices : 
//                                 [],
//                         type: q.type || (subject.includes('mcq') ? 'mcq' : 'text'),
//                         _original: q // Keep original for debugging
//                     };
//                 });
                
//                 setQuestions(cleanedQuestions);
             


                
//             } catch (err) {
//                 console.error('Error loading questions:', err);
//                 setError(err.message);
//                 setQuestions([]);
//             } finally {
//                 setLoading(false);
//             }
//         };
        
//         fetchQuestions();
//     }, [subject]);

//     const addQuestion = async () => {
//         if (!newQuestion.trim()) {
//             alert('Please enter a question');
//             return;
//         }
        
//         try {
//             // ✅ Fix: Use authToken
//             const token = localStorage.getItem('authToken') || 
//                           localStorage.getItem('token');
            
//             if (!token) {
//                 alert('Please login first');
//                 return;
//             }

//             const payload = {
//                 question: newQuestion,
//                 type: subject.includes('mcq') ? 'mcq' : 'text',
//                 options: subject.includes('mcq') ? options.filter(o => o.trim()) : [],
//                 subject: subject
//             };

//             console.log('Adding question:', payload);

//             const response = await fetch(`http://localhost:3000/api/questions/${subject}`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`
//                 },
//                 body: JSON.stringify(payload)
//             });
            

//             // if (!response.ok) {
//             //     const errorData = await response.json();
//             //     throw new Error(errorData.message || 'Failed to add question');
//             // }

            
       

//             // const saved = await response.json();
//             // console.log('Question added:', saved);
            

//              // ✅ Read response text first
//         const responseText = await response.text();
        
//         let result;
//         try {
//             result = JSON.parse(responseText);
//         } catch (parseError) {
//             console.error('Failed to parse JSON:', responseText);
//             throw new Error('Invalid response from server');
//         }
        
//         if (!response.ok) {
//             throw new Error(result.message || `Failed: ${response.status}`);
//         }

//         console.log('Question added:', result);
        
//         // Check if result has success property
//         if (result.success === false) {
//             throw new Error(result.message || 'Question addition failed');
//         }
        
//     //         // Refresh questions
//     //         setQuestions(prev => [...prev, saved]);
//     //         setNewQuestion('');
//     //         setOptions(['', '', '', '']);
//     //         alert('Question added successfully!');
            
//     //     } catch (err) {
//     //         console.error('Error adding question:', err);
//     //         alert(err.message || 'Failed to add question');
//     //     }
//     // };
    
//             // ✅ FIX: Create a clean question object
//             const newQuestionObj = {
//                 id: result.id || result._id || result.question?.id || Date.now(),
//                 question: result.question?.question || 
//                          result.question?.text || 
//                          result.question ||
//                          newQuestion,
//                 options: result.question?.options || 
//                         result.options ||
//                         (subject.includes('mcq') ? options.filter(o => o.trim()) : []),
//                 type: result.type || result.question?.type || 
//                       (subject.includes('mcq') ? 'mcq' : 'text')
//             };
            
//             // ✅ FIX: Validate the object
//             if (!newQuestionObj.question || typeof newQuestionObj.question !== 'string') {
//                 newQuestionObj.question = newQuestion;
//             }
            
//             // ✅ Add to state
//             setQuestions(prev => [...prev, newQuestionObj]);
            
//             // Reset form
//             setNewQuestion('');
//             setOptions(['', '', '', '']);
            
//             // Show success message without alert (optional)
//             alert('Question added successfully!');
            
//         } catch (err) {
//             console.error('Error adding question:', err);
//             alert(err.message || 'Failed to add question');
//         }
//     };




//     const deleteQuestion = async (id) => {
//         if (!window.confirm('Are you sure you want to delete this question?')) return;
        
//         try {
//             const token = localStorage.getItem('authToken') || 
//                           localStorage.getItem('token');
            
//             const response = await fetch(`http://localhost:3000/api/questions/${subject}/${id}`, {
//                 method: 'DELETE',
//                 headers: {
//                     'Authorization': `Bearer ${token}`
//                 }
//             });

//             if (!response.ok) {
//                 throw new Error('Failed to delete question');
//             }

//             setQuestions(prev => prev.filter(q => q.id !== id));
//             alert('Question deleted successfully!');
            
//         } catch (err) {
//             console.error('Error deleting question:', err);
//             alert('Failed to delete question');
//         }
//     };

//     // Function to get question ID safely
//     const getQuestionId = (q, index) => {
//         return q.id || q._id || `temp-${index}`;
//     };

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-gray-100">
//                 <Navbar />
//                 <div className="container mx-auto p-8 max-w-4xl">
//                     <div className="text-center py-12">
//                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//                         <p className="mt-4 text-gray-600">Loading questions...</p>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gray-100">
//             <Navbar />
//             <div className="container mx-auto p-8 max-w-4xl">
//                 {error && (
//                     <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
//                         <p className="text-red-600">{error}</p>
//                     </div>
//                 )}
                
//                 <h1 className="text-3xl font-bold mb-2">Manage Questions: {subject?.replace(/-/g, ' ') || 'Unknown'}</h1>
//                 <p className="text-gray-600 mb-8">Total Questions: {questions.length}</p>

//                 <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
//                     <h2 className="text-2xl font-semibold mb-6">Add New Question</h2>
//                     <textarea
//                         value={newQuestion}
//                         onChange={(e) => setNewQuestion(e.target.value)}
//                         placeholder="Enter question text"
//                         rows="4"
//                         className="w-full p-4 border rounded-lg mb-4"
//                     />

//                     {subject?.includes('mcq') && (
//                         <div className="mb-4">
//                             <p className="font-medium mb-2">Options (for MCQ):</p>
//                             {options.map((opt, i) => (
//                                 <input
//                                     key={i}
//                                     value={opt}
//                                     onChange={(e) => {
//                                         const newOpts = [...options];
//                                         newOpts[i] = e.target.value;
//                                         setOptions(newOpts);
//                                     }}
//                                     placeholder={`Option ${i+1}`}
//                                     className="w-full p-3 border rounded mb-2"
//                                 />
//                             ))}
//                         </div>
//                     )}

//                     <button 
//                         onClick={addQuestion} 
//                         className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
//                         disabled={!newQuestion.trim()}
//                     >
//                         Add Question
//                     </button>
//                 </div>

//                 <div className="bg-white rounded-xl shadow-lg p-8">
//                     <h2 className="text-2xl font-semibold mb-6">Existing Questions ({questions.length})</h2>
                    
//                     {questions.length === 0 ? (
//                         <p className="text-gray-500 text-center py-8">No questions yet. Add your first question above.</p>
//                     ) : (
//                         questions.map((q, i) => (
//                             <div key={getQuestionId(q, i)} className="p-6 bg-gray-50 rounded-lg mb-4 flex justify-between items-start">
//                                 <div className="flex-1">
//                                     <p className="font-medium text-lg">{q.question}</p>
//                                     {q.options && q.options.length > 0 && (
//                                         <ul className="list-disc ml-6 mt-2 space-y-1">
//                                             {q.options.map((opt, j) => (
//                                                 <li key={j} className="text-gray-700">{opt}</li>
//                                             ))}
//                                         </ul>
//                                     )}
//                                     <div className="mt-2 flex space-x-4 text-sm text-gray-500">
//                                         <span>Type: {q.type || 'unknown'}</span>
//                                         <span>ID: {q.id || q._id || 'N/A'}</span>
//                                     </div>
//                                 </div>
//                                 <button 
//                                     onClick={() => deleteQuestion(q.id || q._id)} 
//                                     className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 ml-4"
//                                 >
//                                     Delete
//                                 </button>
//                             </div>
//                         ))
//                     )}
//                 </div>

//                 <Link to="/admin-dashboard" className="mt-8 inline-block px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700">
//                     ← Back to Dashboard
//                 </Link>
//             </div>
//         </div>
//     );
// };

// export default DynamicQuestionManager;


import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const QuestionManager = () => {
  const { examId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [exam, setExam] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    type: 'mcq',
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    marks: 1
  });

  useEffect(() => {
    fetchExamAndQuestions();
  }, [examId]);

  const fetchExamAndQuestions = async () => {
    try {
      const [examRes, qRes] = await Promise.all([
        api.get(`/exams/${examId}`),
        api.get(`/exams/${examId}/questions`)
      ]);
      setExam(examRes.data);
      setQuestions(qRes.data);
    } catch (err) {
      toast.error('Failed to load');
    }
  };

  const addQuestion = async () => {
    if (!newQuestion.questionText.trim() || newQuestion.marks <= 0) {
      toast.error('Fill required fields');
      return;
    }
    if (newQuestion.type === 'mcq' && (!newQuestion.options.every(o => o.trim()) || !newQuestion.correctAnswer)) {
      toast.error('MCQ needs 4 options & correct answer');
      return;
    }
    try {
      await api.post(`/exams/${examId}/questions`, newQuestion);
      toast.success('Question added');
      setNewQuestion({ type: 'mcq', questionText: '', options: ['', '', '', ''], correctAnswer: '', marks: 1 });
      fetchExamAndQuestions();
    } catch (err) {
      toast.error('Failed');
    }
  };

  const deleteQuestion = async (qId) => {
    if (!window.confirm('Delete?')) return;
    try {
      await api.delete(`/exams/${examId}/questions/${qId}`);
      toast.success('Deleted');
      fetchExamAndQuestions();
    } catch (err) {
      toast.error('Failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Manage Questions - {exam?.subject}</h1>
        <p className="mb-8">Duration: {exam?.duration} min | Total Marks: {exam?.totalMarks}</p>

        {/* Add Question Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Add New Question</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <select
              value={newQuestion.type}
              onChange={(e) => setNewQuestion({...newQuestion, type: e.target.value})}
              className="p-3 border rounded-lg"
            >
              <option value="mcq">MCQ</option>
              <option value="theory">Theory</option>
              <option value="coding">Coding</option>
            </select>
            <input
              type="number"
              placeholder="Marks"
              value={newQuestion.marks}
              onChange={(e) => setNewQuestion({...newQuestion, marks: +e.target.value})}
              className="p-3 border rounded-lg"
              min="1"
            />
          </div>
          <textarea
            placeholder="Question Text"
            value={newQuestion.questionText}
            onChange={(e) => setNewQuestion({...newQuestion, questionText: e.target.value})}
            className="w-full p-3 border rounded-lg mb-4"
            rows="4"
          />
          {newQuestion.type === 'mcq' && (
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                {newQuestion.options.map((opt, i) => (
                  <input
                    key={i}
                    placeholder={`Option ${i+1}`}
                    value={opt}
                    onChange={(e) => {
                      const opts = [...newQuestion.options];
                      opts[i] = e.target.value;
                      setNewQuestion({...newQuestion, options: opts});
                    }}
                    className="p-3 border rounded-lg"
                  />
                ))}
              </div>
              <select
                value={newQuestion.correctAnswer}
                onChange={(e) => setNewQuestion({...newQuestion, correctAnswer: e.target.value})}
                className="w-full p-3 border rounded-lg"
              >
                <option value="">Select Correct Answer</option>
                {newQuestion.options.map((opt, i) => (
                  <option key={i} value={opt}>{opt || `Option ${i+1}`}</option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={addQuestion}
            className="bg-green-600 text-white py-3 px-8 rounded-lg hover:bg-green-700 font-bold"
          >
            Add Question
          </button>
        </div>

        {/* Questions List */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Questions ({questions.length})</h2>
          {questions.map((q, idx) => (
            <div key={q.questionId} className="border-b py-4 flex justify-between items-start">
              <div>
                <p className="font-semibold">Q{idx+1}: ({q.type.toUpperCase()} - {q.marks} marks)</p>
                <p>{q.questionText}</p>
                {q.type === 'mcq' && (
                  <p className="text-sm text-green-600 mt-2">Correct: {q.correctAnswer}</p>
                )}
              </div>
              <button
                onClick={() => deleteQuestion(q.questionId)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        <Link to="/admin-dashboard" className="mt-8 inline-block bg-gray-600 text-white py-3 px-6 rounded-lg">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default QuestionManager;