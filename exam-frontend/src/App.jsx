import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx'

import { Toaster } from 'react-hot-toast';

// Auth Components
import Register from './components/Register';
import VerifyEmail from './components/VerifyEmail';
import Login from './components/Login';
import Logout from './components/Logout';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

// Main App Pages
import Home from './pages/Home';
import ExamSelection from './pages/ExamSelection';
import Exam from './pages/Exam';
import Results from './pages/Results';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTheory from './pages/admin/AdminTheory';
import AdminMCQ from './pages/admin/AdminMCQ';
import AdminCoding from './pages/admin/AdminCoding';
import AdminSubmissions from './pages/admin/AdminSubmissions';
// import AdminSubjects from './pages/admin/AdminSubjects';
// import DynamicQuestionManager from './pages/admin/DynamicQuestionManager';
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminRoute from './components/AdminRoute'
// Existing imports ke neeche add karo
import CreateExam from './pages/admin/CreateExam';
import QuestionManager from './pages/admin/QuestionManager'; // ye bhi add kar lo agar nahi hai
import ManageExams from './pages/admin/ManageExams';

function App() {
  return (
       
    <Router>
       <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
        {/* Global Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#fff',
              borderRadius: '8px',
              padding: '16px',
            },
            success: {
              style: { background: '#059669' },
            },
            error: {
              style: { background: '#dc2626' },
            },
          }}
        />

        <Routes>
          {/* ====================== AUTH ROUTES ====================== */}
          
          <Route path="/" element={<Login/>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ====================== MAIN APP ROUTES ====================== */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/exam-selection" element={<ProtectedRoute><ExamSelection /></ProtectedRoute>} />
          <Route path="/exam/:examId" element={<ProtectedRoute><Exam /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />

<Route path="/admin/create-exam" element={<AdminRoute><CreateExam /></AdminRoute>} />
<Route path="/admin/questions/:examId" element={<AdminRoute><QuestionManager /></AdminRoute>} />
<Route path="/admin/exams" element={<AdminRoute><ManageExams /></AdminRoute>} />
          {/* ====================== ADMIN ROUTES ====================== */}
          <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin-theory" element={<AdminRoute><AdminTheory /></AdminRoute>} />
          <Route path="/admin-mcq" element={<AdminRoute><AdminMCQ /></AdminRoute>} />
          <Route path="/admin-coding" element={<AdminRoute><AdminCoding /></AdminRoute>} />
          <Route path="/admin-submissions" element={<AdminRoute><AdminSubmissions /></AdminRoute>} />
          {/* <Route path="/admin-subjects" element={<AdminRoute><AdminSubjects /></AdminRoute>} /> */}
          {/* <Route path="/admin-questions/:subject" element={<AdminRoute><DynamicQuestionManager /></AdminRoute>} /> */}
{/* <Route path="/test-subjects" element={<AdminSubjects />} /> */}
{/* <Route path="/admin-subjects-test" element={<AdminSubjects />} /> */}
{/* <Route path="/admin-subjects" element={<AdminSubjects />} /> */}
          {/* ====================== FALLBACK ====================== */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
      </AuthProvider>
    </Router>
  );
}

export default App;