
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import Timer from '../components/Timer';
import MCQQuestion from '../components/MCQQuestion';
import TheoryQuestion from '../components/TheoryQuestion';
import Editor from '@monaco-editor/react';

const Exam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [mcqScore, setMcqScore] = useState(0);
  const [showMcqResult, setShowMcqResult] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenWarning, setFullscreenWarning] = useState({ active: false, secondsLeft: 0 });
  const exitCountRef = useRef(0);
  const countdownRef = useRef(null);
  const programmaticExitRef = useRef(false);
  const fullscreenDeniedRef = useRef(false);
  const [examStarted, setExamStarted] = useState(false);

  useEffect(() => {
    fetchExam();
  }, [examId]);

  // Do not auto-enter fullscreen on load (browsers block this). We'll require
  // an explicit user gesture via the Start button to begin the exam and enter fullscreen.
  useEffect(() => {
    // noop — kept for clarity
  }, [exam]);

  // Fullscreen change listener
  useEffect(() => {
    const onFullScreenChange = () => {
      const isNowFS = !!document.fullscreenElement;
      setIsFullscreen(isNowFS);

      // If we intentionally triggered an exit (e.g. after submit), ignore this event
      if (programmaticExitRef.current) {
        programmaticExitRef.current = false;
        return;
      }

      if (!isNowFS) {
        // User left fullscreen
        exitCountRef.current = (exitCountRef.current || 0) + 1;
        // If user left fullscreen multiple times, submit immediately
        if (exitCountRef.current >= 2) {
          toast.error('You left fullscreen multiple times. Auto-submitting exam.');
          handleSubmit();
          return;
        }

        // Start countdown to auto-submit (15 seconds)
        startExitCountdown(15);
        toast.error('You left fullscreen. Return within 15 seconds or exam will be auto-submitted.');
      } else {
        // Returned to fullscreen -> cancel countdown
        cancelExitCountdown();
        if (exitCountRef.current > 0) {
          toast.success('Returned to fullscreen. Warning cleared.');
        }
        // reset exit counter on successful return
        exitCountRef.current = 0;
      }
    };

    document.addEventListener('fullscreenchange', onFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullScreenChange);
      cancelExitCountdown();
    };
  }, []);

  const enterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch (err) {
      // Happens when browser blocks programmatic fullscreen (needs user gesture)
      console.warn('Failed to enter fullscreen:', err);
      fullscreenDeniedRef.current = true;
    }
  };

  const startExitCountdown = (seconds = 15) => {
    setFullscreenWarning({ active: true, secondsLeft: seconds });
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setFullscreenWarning(prev => {
        if (prev.secondsLeft <= 1) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
          setFullscreenWarning({ active: false, secondsLeft: 0 });
          // auto-submit
          if (!isSubmitting) {
            toast.error('Auto-submitting exam due to leaving fullscreen');
            handleSubmit();
          }
          return { active: false, secondsLeft: 0 };
        }
        return { ...prev, secondsLeft: prev.secondsLeft - 1 };
      });
    }, 1000);
  };

  const cancelExitCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setFullscreenWarning({ active: false, secondsLeft: 0 });
  };

  const fetchExam = async () => {
    try {
      console.log('🔍 Fetching exam with ID:', examId);
      console.log('🔍 API base URL:', api.defaults.baseURL);
      console.log('🔍 Token:', localStorage.getItem('authToken') ? 'Present' : 'Not found');
      
      const [examRes, qRes] = await Promise.all([
        api.get(`/exams/${examId}`),
        api.get(`/exams/${examId}/questions`)
      ]);
      
      console.log('✅ Exam response:', examRes.data);
      console.log('✅ Questions response:', qRes.data);
      
      const examData = examRes.data;
      const questionsData = Array.isArray(qRes.data) ? qRes.data : (qRes.data?.questions || []);
      
      if (!examData) {
        toast.error('Exam not found');
        navigate('/exam-selection');
        return;
      }
      
      if (questionsData.length === 0) {
        console.warn('⚠️ No questions found for this exam');
        toast.error('No questions found for this exam');
      }
      
      setExam(examData);
      setQuestions(questionsData);
    } catch (err) {
      console.error('❌ Fetch exam error:', err);
      console.error('❌ Error response:', err.response);
      console.error('❌ Error status:', err.response?.status);
      console.error('❌ Error data:', err.response?.data);
      
      let errorMsg = 'Failed to load exam';
      
      if (err.response?.status === 401) {
        errorMsg = 'Please login to view exam';
        toast.error(errorMsg);
        navigate('/login');
        return;
      } else if (err.response?.status === 404) {
        errorMsg = 'Exam not found';
        toast.error(errorMsg);
        navigate('/exam-selection');
        return;
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      toast.error(errorMsg);
    }
  };

  const handleAnswer = (qId, answer) => {
    setAnswers({ ...answers, [qId]: answer });
  };

  const scrollToQuestion = (questionId, index) => {
    setCurrentQuestionIndex(index);
    const element = document.getElementById(`question-${questionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setSidebarOpen(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Calculate MCQ score immediately
    let calculatedMcqScore = 0;
    questions.forEach(q => {
      if (q.type === 'mcq' && answers[q.questionId] === q.correctAnswer) {
        calculatedMcqScore += q.marks;
      }
    });
    setMcqScore(calculatedMcqScore);
    setShowMcqResult(true);
    setShowSubmitModal(false);

    try {
      await api.post('/submissions/submit-exam', {
        examId,
        answers,
        mcqScore: calculatedMcqScore
      });
      toast.success('Exam submitted successfully!');
      // Exit fullscreen after submit — mark as programmatic so we don't treat it as cheating
      try {
        if (document.fullscreenElement) {
          programmaticExitRef.current = true;
          // cancel any pending countdowns
          cancelExitCountdown();
          exitCountRef.current = 0;
          await document.exitFullscreen();
        }
      } catch (e) {
        console.warn('Exit fullscreen failed:', e);
      }
    } catch (err) {
      console.error('Submit exam error:', err);
      toast.error('Failed to submit exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onTimeUp = () => {
    toast.warning('Time is up! Auto-submitting your exam...');
    handleSubmit();
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).filter(key => answers[key] && answers[key].trim() !== '').length;
  };

  const isQuestionAnswered = (questionId) => {
    return answers[questionId] && answers[questionId].toString().trim() !== '';
  };

  const getProgressPercentage = () => {
    if (questions.length === 0) return 0;
    return (getAnsweredCount() / questions.length) * 100;
  };

  if (!exam || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-2xl text-indigo-800 font-semibold">Loading Exam...</p>
          <p className="text-gray-600 mt-2">Please wait while we prepare your exam</p>
        </div>
      </div>
    );
  }

  const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Fullscreen warning banner */}
      {fullscreenWarning.active && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 px-4 py-3 rounded-md shadow-md">
          <div className="flex items-center gap-4">
            <div className="font-semibold">You left fullscreen</div>
            <div>Return within <strong>{fullscreenWarning.secondsLeft}s</strong> or exam will be auto-submitted.</div>
            <div className="ml-4">
              <button onClick={enterFullscreen} className="px-3 py-1 bg-yellow-500 text-white rounded-md mr-2">Return Fullscreen</button>
              <button onClick={() => { cancelExitCountdown(); handleSubmit(); }} className="px-3 py-1 bg-red-600 text-white rounded-md">Submit Now</button>
            </div>
          </div>
        </div>
      )}
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white shadow-lg border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center justify-between md:justify-start gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">{exam.subject || 'Exam'}</h1>
                <p className="text-sm text-gray-600">Total Marks: {totalMarks} • Questions: {questions.length}</p>
              </div>
            </div>

              {/* Start Exam Overlay - requires user gesture to enter fullscreen */}
              {!examStarted && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
                  <div className="bg-white rounded-xl p-8 max-w-lg text-center">
                    <h2 className="text-2xl font-bold mb-2">Ready to Start the Exam?</h2>
                    <p className="text-gray-600 mb-4">To prevent cheating, the exam prefers fullscreen. Click Start to enter fullscreen and begin. If your browser blocks fullscreen, click the button again or choose to start without fullscreen.</p>
                    <div className="flex justify-center gap-4 mt-4">
                      <button
                        onClick={async () => {
                          try { await enterFullscreen(); } catch (e) {}
                          setExamStarted(true);
                        }}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                      >
                        Start Exam (Enter Fullscreen)
                      </button>
                      {/* <button
                        onClick={() => { setExamStarted(true); toast('Starting without fullscreen'); }}
                        className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300"
                      >
                        Start Without Fullscreen
                      </button> */}
                    </div>
                  </div>
                </div>
              )}
            <div className="flex items-center gap-4">
              {examStarted ? (
                <Timer duration={exam.duration} onTimeUp={onTimeUp} />
              ) : (
                <div className="text-sm text-gray-600">Exam will start when you click Start</div>
              )}
              <button
                onClick={() => setShowSubmitModal(true)}
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Exam'}
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress: {getAnsweredCount()} / {questions.length} answered</span>
              <span>{Math.round(getProgressPercentage())}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar - Question Navigator (Desktop) */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-white rounded-xl shadow-lg p-4 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Question Navigator</h3>
            <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
              {questions.map((q, index) => {
                const answered = isQuestionAnswered(q.questionId);
                const isCurrent = index === currentQuestionIndex;
                return (
                  <button
                    key={q.questionId}
                    onClick={() => scrollToQuestion(q.questionId, index)}
                    className={`
                      w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center justify-between
                      ${isCurrent
                        ? 'bg-blue-600 text-white shadow-md'
                        : answered
                          ? 'bg-green-50 text-green-800 border-2 border-green-300 hover:bg-green-100'
                          : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:bg-gray-100'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${isCurrent ? 'text-white' : 'text-gray-600'}`}>
                        Q{index + 1}
                      </span>
                      <span className="text-xs opacity-75">({q.type.toUpperCase()})</span>
                    </div>
                    {answered && (
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setSidebarOpen(false)}>
            <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-2xl p-4 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Questions</h3>
                <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-2">
                {questions.map((q, index) => {
                  const answered = isQuestionAnswered(q.questionId);
                  const isCurrent = index === currentQuestionIndex;
                  return (
                    <button
                      key={q.questionId}
                      onClick={() => scrollToQuestion(q.questionId, index)}
                      className={`
                        w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center justify-between
                        ${isCurrent
                          ? 'bg-blue-600 text-white shadow-md'
                          : answered
                            ? 'bg-green-50 text-green-800 border-2 border-green-300'
                            : 'bg-gray-50 text-gray-700 border-2 border-gray-200'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isCurrent ? 'text-white' : 'text-gray-600'}`}>
                          Q{index + 1}
                        </span>
                        <span className="text-xs opacity-75">({q.type.toUpperCase()})</span>
                      </div>
                      {answered && (
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {questions.map((q, index) => {
            const questionText = q.questionText || q.question || 'Question';
            return (
              <div
                key={q.questionId}
                id={`question-${q.questionId}`}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
              >
                {/* Question Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div className="flex items-center gap-4">
                      <span className="bg-white text-blue-600 px-4 py-1 rounded-full font-bold text-sm">
                        Question {index + 1} of {questions.length}
                      </span>
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase">
                        {q.type}
                      </span>
                      <span className="text-white text-sm font-medium">
                        {q.marks || 0} {q.marks === 1 ? 'mark' : 'marks'}
                      </span>
                    </div>
                    {isQuestionAnswered(q.questionId) && (
                      <div className="flex items-center gap-2 text-green-200">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">Answered</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Question Body */}
                <div className="p-6 md:p-8">
                  <div className="mb-6">
                    <p className="text-lg md:text-xl text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {questionText}
                    </p>
                  </div>

                  {/* Question Type Components */}
                  <div className="mt-6">
                    {q.type === 'mcq' && (
                      <MCQQuestion
                        question={q}
                        onAnswer={(ans) => handleAnswer(q.questionId, ans)}
                        savedAnswer={answers[q.questionId]}
                      />
                    )}
                    {q.type === 'theory' && (
                      <TheoryQuestion
                        question={q}
                        onAnswer={(ans) => handleAnswer(q.questionId, ans)}
                        savedAnswer={answers[q.questionId]}
                      />
                    )}
                    {q.type === 'coding' && (
                      <div className="border-2 border-gray-300 rounded-xl overflow-hidden">
                        <Editor
                          height="400px"
                          defaultLanguage="javascript"
                          value={answers[q.questionId] || ''}
                          onChange={(value) => handleAnswer(q.questionId, value || '')}
                          theme="vs-dark"
                          options={{
                            fontSize: 14,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            wordWrap: 'on'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Submit Button (Bottom) */}
          <div className="sticky bottom-4 bg-white rounded-xl shadow-2xl border-2 border-gray-200 p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="text-sm text-gray-600">
                <p className="font-semibold">Ready to submit?</p>
                <p>You have answered {getAnsweredCount()} out of {questions.length} questions</p>
              </div>
              <button
                onClick={() => setShowSubmitModal(true)}
                disabled={isSubmitting}
                className="w-full md:w-auto px-8 py-3 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Exam'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Confirm Submission</h3>
              <p className="text-gray-600">
                Are you sure you want to submit your exam?
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Answered:</span> {getAnsweredCount()} / {questions.length} questions
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  <span className="font-semibold">Unanswered:</span> {questions.length - getAnsweredCount()} questions
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showMcqResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">Exam Submitted!</h3>
              <p className="text-gray-600 mb-6">Your exam has been submitted successfully</p>
              
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6 border-2 border-green-200">
                <p className="text-sm text-gray-600 mb-2">MCQ Score (Immediate Result)</p>
                <p className="text-4xl font-bold text-green-600">{mcqScore} marks</p>
                <p className="text-sm text-gray-600 mt-2">
                  Theory and Coding questions will be evaluated manually by the admin.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowMcqResult(false);
                  navigate('/results');
                }}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                View All Results
              </button>
              {/* <button
                onClick={() => {
                  setShowMcqResult(false);
                  navigate('/exam-selection');
                }}
                className="w-full mt-3 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Back to Exams
              </button> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exam;
