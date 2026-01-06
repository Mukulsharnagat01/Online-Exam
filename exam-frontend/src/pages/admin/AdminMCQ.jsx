// import React, { useState, useEffect } from 'react';
// import Navbar from '../../components/Navbar';

// const AdminMCQ = () => {
//     const [questions, setQuestions] = useState([]);
//     const [newQuestion, setNewQuestion] = useState('');
//     const [options, setOptions] = useState(['', '', '', '']);

//     useEffect(() => {
//   // ✅ LOCALSTORAGE KI JAGAH BACKEND SE DATA FETCH KARO
//   fetch(`http://localhost:3000/api/questions/mcq`)
//     .then(res => res.json())
//     .then(data => setQuestions(data))
//     .catch(err => console.error('Error loading questions:', err));
// }, []);


//     const addQuestion = () => {
//         if (newQuestion.trim() && options.every(opt => opt.trim())) {
//             const updated = [...questions, { type: 'mcq',  question: newQuestion, options }];
//            const addQuestion = async () => {
//     const res = await fetch("http://localhost:3000/api/questions/mcq", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("token")}`
//         },
//         body: JSON.stringify({
//             question: newQuestion,
//             options,
//             type: "mcq"
//         })
//     });

//     const saved = await res.json();
//     setQuestions(prev => [...prev, saved]);
// };

//             setNewQuestion('');
//             setOptions(['', '', '', '']);
//         }
//     };

//     const deleteQuestion = (index) => {
//         const updated = questions.filter((_, i) => i !== index);
//         const deleteQuestion = async (id) => {
//     await fetch(`http://localhost:3000/api/questions/${id}`, {
//         method: "DELETE",
//         headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`
//         }
//     });

//     setQuestions(prev => prev.filter(q => q.id !== id));
// };

//     };

//     return (
//         <div className="min-h-screen bg-gray-100">
//             <Navbar />
//             <div className="container mx-auto p-4">
//                 <h1 className="text-2xl font-bold mb-4">Admin - MCQ Questions</h1>
//                 <div className="bg-white p-6 rounded-lg shadow-md mb-6">
//                     <h2 className="text-xl font-semibold mb-4">Add New MCQ Question</h2>
//                     <input
//                         placeholder="Question"
//                         value={newQuestion}
//                         onChange={(e) => setNewQuestion(e.target.value)}
//                         className="w-full p-2 border border-gray-300 rounded mb-4"
//                     />
//                     {options.map((opt, i) => (
//                         <input
//                             key={i}
//                             placeholder={`Option ${i + 1}`}
//                             value={opt}
//                             onChange={(e) => {
//                                 const newOpts = [...options];
//                                 newOpts[i] = e.target.value;
//                                 setOptions(newOpts);
//                             }}
//                             className="w-full p-2 border border-gray-300 rounded mb-2"
//                         />
//                     ))}
//                     <button onClick={addQuestion} className="px-4 py-2 bg-blue-500 text-white rounded">
//                         Add Question
//                     </button>
//                 </div>
//                 <div className="bg-white p-6 rounded-lg shadow-md">
//                     <h2 className="text-xl font-semibold mb-4">Existing Questions</h2>
//                     {questions.map((q, i) => (
//                         <div key={i} className="mb-4 p-4 border border-gray-200 rounded">
//                             <p className="font-semibold">{q.question}</p>
//                             <ul className="list-disc list-inside">
//                                 {q.options.map((opt, j) => <li key={j}>{opt}</li>)}
//                             </ul>
//                             <button onClick={() => deleteQuestion(i)} className="mt-2 px-3 py-1 bg-red-500 text-white rounded">
//                                 Delete
//                             </button>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AdminMCQ;





// import React, { useState, useEffect } from 'react';
// import Navbar from '../../components/Navbar';

// const AdminMCQ = () => {
//     const [questions, setQuestions] = useState([]);
//     const [newQuestion, setNewQuestion] = useState('');
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchQuestions = async () => {
//             try {
//                 // ✅ Fix: Use authToken
//                 const token = localStorage.getItem('authToken') || 
//                               localStorage.getItem('token');
                
//                 const response = await fetch("http://localhost:3000/api/questions/mcq", {
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                         'Content-Type': 'application/json'
//                     }
//                 });
                
//                 if (!response.ok) {
//                     throw new Error(`Failed to fetch: ${response.status}`);
//                 }
                
//                 const data = await response.json();
                
//                 // ✅ Handle response format
//                 if (data.success && data.questions) {
//                     setQuestions(data.questions);
//                 } else if (Array.isArray(data)) {
//                     setQuestions(data);
//                 } else {
//                     setQuestions([]);
//                 }
                
//             } catch (err) {
//                 console.error('Error loading questions:', err);
//             } finally {
//                 setLoading(false);
//             }
//         };
        
//         fetchQuestions();
//     }, []);

//     const addQuestion = async () => {
//         if (!newQuestion.trim()) return;

//         try {
//             const token = localStorage.getItem('authToken') || 
//                           localStorage.getItem('token');
            
//             const response = await fetch("http://localhost:3000/api/questions/mcq", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     'Authorization': `Bearer ${token}`
//                 },
//                 body: JSON.stringify({
//                     question: newQuestion,
//                     type: "mcq"
//                 })
//             });

//             if (!response.ok) {
//                 throw new Error('Failed to add question');
//             }

//             const saved = await response.json();
//             setQuestions(prev => [...prev, saved]);
//             setNewQuestion('');
//             setOptions(['', '', '', '']);
//             alert('Question added successfully!');
            
//         } catch (err) {
//             console.error('Error adding question:', err);
//             alert('Failed to add question');
//         }
//     };

//     const deleteQuestion = async (id) => {
//         if (!window.confirm('Are you sure you want to delete this question?')) return;
        
//         try {
//             const token = localStorage.getItem('authToken') || 
//                           localStorage.getItem('token');
            
//             const response = await fetch(`http://localhost:3000/api/questions/mcq/${id}`, {
//                 method: "DELETE",
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

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-gray-100">
//                 <Navbar />
//                 <div className="container mx-auto p-4">
//                     <p className="text-center py-12">Loading questions...</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gray-100">
//             <Navbar />
//             <div className="container mx-auto p-4">
//                 <h1 className="text-2xl font-bold mb-6">Admin -MCQ Questions</h1>
                
//                 <div className="bg-white p-6 rounded-lg shadow-md mb-6">
//                     <h2 className="text-xl font-semibold mb-4">Add New MCQ Question</h2>
//                     <textarea
//                         placeholder="Question"
//                         value={newQuestion}
//                         onChange={(e) => setNewQuestion(e.target.value)}
//                         className="w-full p-3 border border-gray-300 rounded mb-4"
//                         rows="4"
//                     />
//                     <button 
//                         onClick={addQuestion} 
//                         className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
//                         disabled={!newQuestion.trim()}
//                     >
//                         Add Question
//                     </button>
//                 </div>
                
//                 <div className="bg-white p-6 rounded-lg shadow-md">
//                     <h2 className="text-xl font-semibold mb-4">Existing Questions ({questions.length})</h2>
//                     {questions.length === 0 ? (
//                         <p className="text-gray-500 text-center py-4">No questions yet</p>
//                     ) : (
//                         questions.map((q, i) => (
//                             <div key={q.id || i} className="mb-4 p-4 border border-gray-200 rounded flex justify-between items-start">
//                                 <div>
//                                     <p className="font-medium">{q.question}</p>
//                                     <p className="text-sm text-gray-500 mt-1">ID: {q.id || 'N/A'}</p>
//                                 </div>
//                                 <button 
//                                     onClick={() => deleteQuestion(q.id)} 
//                                     className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
//                                 >
//                                     Delete
//                                 </button>
//                             </div>
//                         ))
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AdminMCQ;



import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';

const AdminMCQ = () => {
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [loading, setLoading] = useState(true);
    const [subjectsLoading, setSubjectsLoading] = useState(true);

    // Fetch all subjects
    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const token = localStorage.getItem('authToken') || 
                              localStorage.getItem('token');
                
                const response = await fetch("http://localhost:3000/api/subjects", {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch subjects: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Handle response format
                if (Array.isArray(data)) {
                    setSubjects(data);
                } else if (data.success && Array.isArray(data.subjects)) {
                    setSubjects(data.subjects);
                } else if (data.data && Array.isArray(data.data)) {
                    setSubjects(data.data);
                } else {
                    setSubjects(['mathematics', 'physics', 'chemistry']);
                }
                
            } catch (err) {
                console.error('Error loading subjects:', err);
            } finally {
                setSubjectsLoading(false);
            }
        };
        
        fetchSubjects();
    }, []);

    // Fetch questions when subject changes
    useEffect(() => {
        if (selectedSubject) {
            fetchQuestions(selectedSubject);
        } else {
            setQuestions([]);
        }
    }, [selectedSubject]);

    const fetchQuestions = async (subject) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken') || 
                          localStorage.getItem('token');
            
            const response = await fetch(`http://localhost:3000/api/questions/${subject}?type=mcq`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Filter only MCQ questions
            let questionsArray = [];
            if (Array.isArray(data)) {
                questionsArray = data.filter(q => q.type === 'mcq');
            } else if (data.success && Array.isArray(data.questions)) {
                questionsArray = data.questions.filter(q => q.type === 'mcq');
            }
            
            setQuestions(questionsArray);
            
        } catch (err) {
            console.error('Error loading questions:', err);
            setQuestions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubjectSelect = (subject) => {
        setSelectedSubject(subject);
        setNewQuestion('');
        setOptions(['', '', '', '']);
        setCorrectAnswer('');
    };

    const addQuestion = async () => {
        if (!selectedSubject) {
            alert('Please select a subject first');
            return;
        }

        if (!newQuestion.trim()) {
            alert('Question text is required');
            return;
        }

        if (options.some(opt => !opt.trim())) {
            alert('All MCQ options are required');
            return;
        }

        if (!correctAnswer.trim()) {
            alert('Please select a correct answer');
            return;
        }

        try {
            const token = localStorage.getItem('authToken') || 
                          localStorage.getItem('token');
            
            const response = await fetch("http://localhost:3000/api/questions/mcq", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    subject: selectedSubject,
                    question: newQuestion,
                    options: options,
                    correctAnswer: correctAnswer,
                    type: "mcq"
                })
            });

            if (!response.ok) {
                throw new Error('Failed to add question');
            }

            const saved = await response.json();
            setQuestions(prev => [...prev, saved]);
            setNewQuestion('');
            setOptions(['', '', '', '']);
            setCorrectAnswer('');
            alert('MCQ added successfully!');
            
        } catch (err) {
            console.error('Error adding question:', err);
            alert('Failed to add question');
        }
    };

    const deleteQuestion = async (id) => {
        if (!window.confirm('Are you sure you want to delete this question?')) return;
        
        try {
            const token = localStorage.getItem('authToken') || 
                          localStorage.getItem('token');
            
            const response = await fetch(`http://localhost:3000/api/questions/mcq/${id}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete question');
            }

            setQuestions(prev => prev.filter(q => q.id !== id));
            alert('Question deleted successfully!');
            
        } catch (err) {
            console.error('Error deleting question:', err);
            alert('Failed to delete question');
        }
    };

    const updateOption = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    if (subjectsLoading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Navbar />
                <div className="container mx-auto p-4">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading subjects...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto p-4 max-w-6xl">
                <h1 className="text-2xl font-bold mb-6">Admin - MCQ Questions Management</h1>
                
                {/* Subject Selection Card */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Select Subject for MCQ Questions</h2>
                    
                    {!selectedSubject ? (
                        <div>
                            <p className="text-gray-600 mb-4">Choose a subject to add/view MCQ questions:</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {subjects.map((subject, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSubjectSelect(subject)}
                                        className="p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-center transition"
                                    >
                                        <span className="font-medium capitalize">{subject.replace(/-/g, ' ')}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-green-700 font-medium">
                                        Selected Subject: <span className="capitalize">{selectedSubject.replace(/-/g, ' ')}</span>
                                    </p>
                                    <p className="text-sm text-green-600">Total MCQ Questions: {questions.length}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedSubject('')}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                >
                                    Change Subject
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Add MCQ Form - Only show when subject is selected */}
                {selectedSubject && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">
                            Add New MCQ to <span className="text-blue-600 capitalize">{selectedSubject.replace(/-/g, ' ')}</span>
                        </h2>
                        
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Question:</label>
                            <textarea
                                placeholder="Enter your MCQ question..."
                                value={newQuestion}
                                onChange={(e) => setNewQuestion(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded"
                                rows="3"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Options:</label>
                            {options.map((opt, i) => (
                                <div key={i} className="flex items-center mb-3">
                                    <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded mr-3">
                                        <span className="font-medium">{String.fromCharCode(65 + i)}</span>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                        value={opt}
                                        onChange={(e) => updateOption(i, e.target.value)}
                                        className="flex-1 p-2 border border-gray-300 rounded"
                                    />
                                    <button
                                        onClick={() => setCorrectAnswer(opt)}
                                        className={`ml-3 px-4 py-2 rounded ${correctAnswer === opt ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                    >
                                        {correctAnswer === opt ? 'Correct ✓' : 'Mark Correct'}
                                    </button>
                                </div>
                            ))}
                        </div>

                        {correctAnswer && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                                <p className="text-green-700 font-medium">
                                    ✓ Correct Answer Selected: {correctAnswer}
                                </p>
                            </div>
                        )}

                        <button 
                            onClick={addQuestion}
                            disabled={!newQuestion.trim() || !correctAnswer || options.some(opt => !opt.trim())}
                            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add MCQ Question
                        </button>
                    </div>
                )}

                {/* Questions List - Only show when subject is selected */}
                {selectedSubject && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">
                                MCQ Questions in <span className="text-blue-600 capitalize">{selectedSubject.replace(/-/g, ' ')}</span>
                            </h2>
                            <button
                                onClick={() => fetchQuestions(selectedSubject)}
                                className="text-blue-600 hover:text-blue-800"
                                disabled={loading}
                            >
                                {loading ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </div>

                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-2 text-gray-600">Loading questions...</p>
                            </div>
                        ) : questions.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No MCQ questions yet for this subject.</p>
                        ) : (
                            <div className="space-y-4">
                                {questions.map((q, i) => (
                                    <div key={q.id || i} className="p-4 border border-gray-200 rounded hover:bg-gray-50">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="font-medium mb-2">{q.question}</p>
                                                {q.options && (
                                                    <div className="ml-4">
                                                        {q.options.map((opt, j) => (
                                                            <div key={j} className="flex items-center mb-1">
                                                                <div className={`w-6 h-6 flex items-center justify-center rounded mr-2 ${q.correctAnswer === opt ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                                                                    {String.fromCharCode(65 + j)}
                                                                </div>
                                                                <span className={q.correctAnswer === opt ? 'font-medium text-green-700' : 'text-gray-700'}>
                                                                    {opt}
                                                                    {q.correctAnswer === opt && ' ✓'}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <p className="text-sm text-gray-500 mt-2">Subject: {q.subject || selectedSubject}</p>
                                            </div>
                                            <button 
                                                onClick={() => deleteQuestion(q.id)}
                                                className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminMCQ;