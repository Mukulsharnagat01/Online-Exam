

import React, { useState, useEffect } from 'react';
import { Award, Clock, Download, Eye, FileText, Filter } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const Results = () => {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, published, pending

  useEffect(() => {
    fetchResults();
  }, []);

  useEffect(() => {
    filterResults();
  }, [filter, results]);

  const fetchResults = async () => {
    try {
      console.log('🔍 Fetching results...');
      console.log('🔍 API base URL:', api.defaults.baseURL);
      console.log('🔍 Token:', localStorage.getItem('authToken') ? 'Present' : 'Not found');
      // Fetch results from Results table (published results)
      const response = await api.get('/submissions/my-results');
      console.log('✅ Results response:', response.data);
      
      // Handle different response formats
      let resultsData = [];
      if (Array.isArray(response.data)) {
        resultsData = response.data;
      } else if (response.data?.submissions) {
        resultsData = response.data.submissions;
      } else if (response.data?.items) {
        resultsData = response.data.items;
      } else if (response.data?.result) {
        // single result object
        resultsData = [response.data.result];
      }

      // Normalize backend result shape to frontend expected fields
      const normalized = resultsData.map(r => ({
        submissionId: r.submissionId || r.id || r.resultId,
        status: r.status || r.resultStatus || (r.percentage !== undefined ? 'published' : r.status),
        score: r.score ?? r.obtainedMarks ?? r.totalMarksObtained ?? r.mcqScore ?? null,
        totalMarks: r.totalMarks ?? r.totalMarks ?? r.totalMarksObtained ?? null,
        percentage: r.percentage ?? (r.score && r.totalMarks ? (r.score / r.totalMarks) * 100 : r.percentage) ?? r.percentage,
        submittedAt: r.submittedAt || r.evaluatedAt || r.timestamp || r.evaluatedAt,
        examId: r.examId,
        examTitle: r.examTitle || r.subject || r.title || r.examId,
        examType: r.examType,
        timeSpent: r.timeTaken || r.timeSpent || null,
        remarks: r.feedback || r.remarks || r.message || '',
        resultUrl: r.resultUrl || r.pdfUrl || null
      }));

      console.log('✅ Processed results data:', normalized);
      setResults(normalized);
    } catch (error) {
      console.error('❌ Fetch results error:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error data:', error.response?.data);
      
      let errorMsg = 'Failed to load results';
      
      if (error.response?.status === 401) {
        errorMsg = 'Please login to view results';
        toast.error(errorMsg);
        // Could redirect to login here if needed
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const filterResults = () => {
    let filtered = [...results];
    
    if (filter === 'published') {
      filtered = filtered.filter(r => r.status === 'published');
    } else if (filter === 'pending') {
      filtered = filtered.filter(r => r.status === 'submitted');
    }
    
    setFilteredResults(filtered);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Result Published</span>;
      case 'submitted':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Evaluation Pending</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">Submitted</span>;
    }
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGrade = (percentage) => {
    if (percentage >= 80) return 'A+';
    if (percentage >= 70) return 'A';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  };

  const downloadResult = (resultUrl) => {
    if (resultUrl) {
      window.open(resultUrl, '_blank');
    } else {
      toast.error('Result PDF not available');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <Award className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Exam Results</h1>
            <p className="text-lg text-green-100">
              View your exam performance and results
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold text-gray-900">
                {filteredResults.length} {filter === 'all' ? 'Total' : filter} Results
              </h2>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('published')}
                className={`px-4 py-2 rounded-lg ${filter === 'published' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Published
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg ${filter === 'pending' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                Pending
              </button>
            </div>
          </div>
        </div>

        {/* Results List */}
        {filteredResults.length > 0 ? (
          <div className="space-y-6">
            {filteredResults.map((result) => {
              const percentage = result.score && result.totalMarks 
                ? ((result.score / result.totalMarks) * 100).toFixed(1)
                : null;

              return (
                <div key={result.submissionId} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{result.examTitle}</h3>
                        <div className="flex items-center mt-2 space-x-3">
                          {getStatusBadge(result.status)}
                          <span className="text-sm text-gray-500">
                            {new Date(result.submittedAt).toLocaleDateString()}
                          </span>
                          <span className="text-sm text-gray-500">
                            {result.examType?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      {result.status === 'published' && percentage && (
                        <div className="mt-4 md:mt-0 text-center">
                          <div className={`text-3xl font-bold ${getGradeColor(parseFloat(percentage))}`}>
                            {percentage}%
                          </div>
                          <div className="text-sm text-gray-600">Grade: {getGrade(parseFloat(percentage))}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500 mb-1">Score</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {result.score !== null ? `${result.score}/${result.totalMarks}` : '--'}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500 mb-1">Time Spent</div>
                        <div className="text-lg font-bold text-gray-900">
                          {result.timeSpent ? `${Math.floor(result.timeSpent / 60)}m ${result.timeSpent % 60}s` : '--'}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-500 mb-1">Submission ID</div>
                        <div className="text-sm font-mono text-gray-700 truncate">
                          {result.submissionId}
                        </div>
                      </div>
                    </div>
                    
                    {result.remarks && result.status === 'published' && (
                      <div className="mb-6">
                        <h4 className="font-bold text-gray-900 mb-2">Remarks:</h4>
                        <p className="text-gray-700 bg-blue-50 p-4 rounded-lg">{result.remarks}</p>
                      </div>
                    )}
                    
                    {/* <div className="flex justify-end space-x-3">
                      {result.status === 'published' && (
                        <>
                          <button
                            onClick={() => downloadResult(result.resultUrl)}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Result
                          </button>
                          {result.resultUrl && (
                            <button
                              onClick={() => window.open(result.resultUrl, '_blank')}
                              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View PDF
                            </button>
                          )}
                        </>
                      )}
                    </div> */}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">No results found</h3>
            <p className="text-gray-500">
              {filter !== 'all' 
                ? `No ${filter} results available` 
                : 'You have not attempted any exams yet'}
            </p>
          </div>
        )}

        {/* Summary Stats */}
        {filteredResults.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-green-600">
                  {filteredResults.filter(r => r.status === 'published').length}
                </div>
                <div className="text-sm text-gray-600">Results Published</div>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {filteredResults.filter(r => r.status === 'submitted').length}
                </div>
                <div className="text-sm text-gray-600">Pending Evaluation</div>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredResults.length}
                </div>
                <div className="text-sm text-gray-600">Total Attempts</div>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {filteredResults.filter(r => r.status === 'published').length > 0
                    ? filteredResults
                        .filter(r => r.status === 'published')
                        .reduce((acc, r) => {
                          const percentage = r.score && r.totalMarks ? (r.score / r.totalMarks) * 100 : 0;
                          return acc + percentage;
                        }, 0) / filteredResults.filter(r => r.status === 'published').length
                    : 0
                  }%
                </div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;





// import React, { useState, useEffect } from 'react';
// import { Award, Clock, Download, Eye, FileText, Filter } from 'lucide-react';
// import api from '../services/api';
// import { toast } from 'react-hot-toast';

// const Results = () => {
//   const [results, setResults] = useState([]);
//   const [filteredResults, setFilteredResults] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState('all'); // all, published, pending

//   useEffect(() => {
//     fetchResults();
//   }, []);

//   useEffect(() => {
//     filterResults();
//   }, [filter, results]);

//   const fetchResults = async () => {
//     try {
//       console.log('🔍 Fetching results...');
//       console.log('🔍 API base URL:', api.defaults.baseURL);
//       console.log('🔍 Token:', localStorage.getItem('authToken') ? 'Present' : 'Not found');
//       // Fetch results from Results table (published results)
//       const response = await api.get('/submissions/my-results');
//       console.log('✅ Results response:', response.data);
      
//       // Handle different response formats
//       let resultsData = [];
//       if (Array.isArray(response.data)) {
//         resultsData = response.data;
//       } else if (response.data?.submissions) {
//         resultsData = response.data.submissions;
//       } else if (response.data?.items) {
//         resultsData = response.data.items;
//       } else if (response.data?.result) {
//         // single result object
//         resultsData = [response.data.result];
//       }

//       // Normalize backend result shape to frontend expected fields
//       const normalized = resultsData.map(r => ({
//         submissionId: r.submissionId || r.id || r.resultId,
//         status: r.status || r.resultStatus || (r.percentage !== undefined ? 'published' : r.status),
//         score: r.score ?? r.obtainedMarks ?? r.totalMarksObtained ?? r.mcqScore ?? null,
//         totalMarks: r.totalMarks ?? r.totalMarks ?? r.totalMarksObtained ?? null,
//         percentage: r.percentage ?? (r.score && r.totalMarks ? (r.score / r.totalMarks) * 100 : r.percentage) ?? r.percentage,
//         submittedAt: r.submittedAt || r.evaluatedAt || r.timestamp || r.evaluatedAt,
//         examId: r.examId,
//         examTitle: r.examTitle || r.subject || r.title || r.examId,
//         examType: r.examType,
//         timeSpent: r.timeTaken || r.timeSpent || null,
//         remarks: r.feedback || r.remarks || r.message || '',
//         resultUrl: r.resultUrl || r.pdfUrl || null
//       }));

//       console.log('✅ Processed results data:', normalized);
//       setResults(normalized);
//     } catch (error) {
//       console.error('❌ Fetch results error:', error);
//       console.error('❌ Error response:', error.response);
//       console.error('❌ Error status:', error.response?.status);
//       console.error('❌ Error data:', error.response?.data);
      
//       let errorMsg = 'Failed to load results';
      
//       if (error.response?.status === 401) {
//         errorMsg = 'Please login to view results';
//         toast.error(errorMsg);
//         // Could redirect to login here if needed
//       } else if (error.response?.data?.message) {
//         errorMsg = error.response.data.message;
//       } else if (error.message) {
//         errorMsg = error.message;
//       }
      
//       toast.error(errorMsg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterResults = () => {
//     let filtered = [...results];
    
//     if (filter === 'published') {
//       filtered = filtered.filter(r => r.status === 'published');
//     } else if (filter === 'pending') {
//       filtered = filtered.filter(r => r.status === 'submitted');
//     }
    
//     setFilteredResults(filtered);
//   };

//   const getStatusBadge = (status) => {
//     switch (status) {
//       case 'published':
//         return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Result Published</span>;
//       case 'submitted':
//         return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Evaluation Pending</span>;
//       default:
//         return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">Submitted</span>;
//     }
//   };

//   const getGradeColor = (percentage) => {
//     if (percentage >= 80) return 'text-green-600';
//     if (percentage >= 60) return 'text-blue-600';
//     if (percentage >= 40) return 'text-yellow-600';
//     return 'text-red-600';
//   };

//   const getGrade = (percentage) => {
//     if (percentage >= 80) return 'A+';
//     if (percentage >= 70) return 'A';
//     if (percentage >= 60) return 'B';
//     if (percentage >= 50) return 'C';
//     if (percentage >= 40) return 'D';
//     return 'F';
//   };

//   const downloadResult = (resultUrl) => {
//     if (resultUrl) {
//       window.open(resultUrl, '_blank');
//     } else {
//       toast.error('Result PDF not available');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white">
//         <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <Award className="w-16 h-16 mx-auto mb-4" />
//             <h1 className="text-3xl md:text-4xl font-bold mb-4">Exam Results</h1>
//             <p className="text-lg text-green-100">
//               View your exam performance and results
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Filters */}
//       <div className="max-w-7xl mx-auto px-4 py-6">
//         <div className="bg-white rounded-xl shadow p-4 mb-6">
//           <div className="flex flex-col md:flex-row justify-between items-center">
//             <div className="mb-4 md:mb-0">
//               <h2 className="text-xl font-bold text-gray-900">
//                 {filteredResults.length} {filter === 'all' ? 'Total' : filter} Results
//               </h2>
//             </div>
            
//             <div className="flex space-x-2">
//               <button
//                 onClick={() => setFilter('all')}
//                 className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
//               >
//                 All
//               </button>
//               <button
//                 onClick={() => setFilter('published')}
//                 className={`px-4 py-2 rounded-lg ${filter === 'published' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
//               >
//                 Published
//               </button>
//               <button
//                 onClick={() => setFilter('pending')}
//                 className={`px-4 py-2 rounded-lg ${filter === 'pending' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
//               >
//                 Pending
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Results List */}
//         {filteredResults.length > 0 ? (
//           <div className="space-y-6">
//             {filteredResults.map((result) => {
//               const percentage = result.score && result.totalMarks 
//                 ? ((result.score / result.totalMarks) * 100).toFixed(1)
//                 : null;

//               return (
//                 <div key={result.submissionId} className="bg-white rounded-xl shadow-lg overflow-hidden">
//                   <div className="p-6">
//                     <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
//                       <div>
//                         <h3 className="text-xl font-bold text-gray-900">{result.examTitle}</h3>
//                         <div className="flex items-center mt-2 space-x-3">
//                           {getStatusBadge(result.status)}
//                           <span className="text-sm text-gray-500">
//                             {new Date(result.submittedAt).toLocaleDateString()}
//                           </span>
//                           <span className="text-sm text-gray-500">
//                             {result.examType?.toUpperCase()}
//                           </span>
//                         </div>
//                       </div>
                      
//                       {result.status === 'published' && percentage && (
//                         <div className="mt-4 md:mt-0 text-center">
//                           <div className={`text-3xl font-bold ${getGradeColor(parseFloat(percentage))}`}>
//                             {percentage}%
//                           </div>
//                           <div className="text-sm text-gray-600">Grade: {getGrade(parseFloat(percentage))}</div>
//                         </div>
//                       )}
//                     </div>
                    
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//                       <div className="bg-gray-50 p-4 rounded-lg">
//                         <div className="text-sm text-gray-500 mb-1">Score</div>
//                         <div className="text-2xl font-bold text-gray-900">
//                           {result.score !== null ? `${result.score}/${result.totalMarks}` : '--'}
//                         </div>
//                       </div>
                      
//                       <div className="bg-gray-50 p-4 rounded-lg">
//                         <div className="text-sm text-gray-500 mb-1">Time Spent</div>
//                         <div className="text-lg font-bold text-gray-900">
//                           {result.timeSpent ? `${Math.floor(result.timeSpent / 60)}m ${result.timeSpent % 60}s` : '--'}
//                         </div>
//                       </div>
                      
//                       <div className="bg-gray-50 p-4 rounded-lg">
//                         <div className="text-sm text-gray-500 mb-1">Submission ID</div>
//                         <div className="text-sm font-mono text-gray-700 truncate">
//                           {result.submissionId}
//                         </div>
//                       </div>
//                     </div>
                    
//                     {result.remarks && result.status === 'published' && (
//                       <div className="mb-6">
//                         <h4 className="font-bold text-gray-900 mb-2">Remarks:</h4>
//                         <p className="text-gray-700 bg-blue-50 p-4 rounded-lg">{result.remarks}</p>
//                       </div>
//                     )}
                    
//                     {/* <div className="flex justify-end space-x-3">
//                       {result.status === 'published' && (
//                         <>
//                           <button
//                             onClick={() => downloadResult(result.resultUrl)}
//                             className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
//                           >
//                             <Download className="w-4 h-4 mr-2" />
//                             Download Result
//                           </button>
//                           {result.resultUrl && (
//                             <button
//                               onClick={() => window.open(result.resultUrl, '_blank')}
//                               className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                             >
//                               <Eye className="w-4 h-4 mr-2" />
//                               View PDF
//                             </button>
//                           )}
//                         </>
//                       )}
//                     </div> */}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         ) : (
//           <div className="text-center py-12">
//             <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-xl font-bold text-gray-600 mb-2">No results found</h3>
//             <p className="text-gray-500">
//               {filter !== 'all' 
//                 ? `No ${filter} results available` 
//                 : 'You have not attempted any exams yet'}
//             </p>
//           </div>
//         )}

//         {/* Summary Stats */}
//         {filteredResults.length > 0 && (
//           <div className="mt-8 bg-white rounded-xl shadow p-6">
//             <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Summary</h3>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               <div className="text-center p-4">
//                 <div className="text-2xl font-bold text-green-600">
//                   {filteredResults.filter(r => r.status === 'published').length}
//                 </div>
//                 <div className="text-sm text-gray-600">Results Published</div>
//               </div>
//               <div className="text-center p-4">
//                 <div className="text-2xl font-bold text-yellow-600">
//                   {filteredResults.filter(r => r.status === 'submitted').length}
//                 </div>
//                 <div className="text-sm text-gray-600">Pending Evaluation</div>
//               </div>
//               <div className="text-center p-4">
//                 <div className="text-2xl font-bold text-blue-600">
//                   {filteredResults.length}
//                 </div>
//                 <div className="text-sm text-gray-600">Total Attempts</div>
//               </div>
//               <div className="text-center p-4">
//                 <div className="text-2xl font-bold text-purple-600">
//                   {filteredResults.filter(r => r.status === 'published').length > 0
//                     ? filteredResults
//                         .filter(r => r.status === 'published')
//                         .reduce((acc, r) => {
//                           const percentage = r.score && r.totalMarks ? (r.score / r.totalMarks) * 100 : 0;
//                           return acc + percentage;
//                         }, 0) / filteredResults.filter(r => r.status === 'published').length
//                     : 0
//                   }%
//                 </div>
//                 <div className="text-sm text-gray-600">Average Score</div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Results;



