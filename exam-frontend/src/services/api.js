

import axios from 'axios';

// Simple configuration - Use proxy in dev, full URL in production
// Vite proxy forwards /api/* to http://localhost:3000
// Normalize baseURL: prefer '/api' in development to ensure local proxy is used
const _rawEnvBase = (import.meta.env.VITE_API_URL || '').toString().trim();
const _envMode = import.meta.env.MODE;
let normalizedBase = '/api';
try {
  if (_envMode === 'development') {
    // Force local proxy during development so front-end talks to local backend
    normalizedBase = '/api';
  } else if (_rawEnvBase) {
    // Production or explicit env: normalize provided URL and ensure '/api' suffix
    normalizedBase = _rawEnvBase.replace(/\/+$/g, '');
    if (!normalizedBase.endsWith('/api')) normalizedBase = normalizedBase + '/api';
  } else {
    normalizedBase = '/api';
  }
} catch (e) {
  normalizedBase = '/api';
}

const api = axios.create({
  // In development: use /api as baseURL since Vite proxy handles it
  // In production: use full backend URL from env or default (normalized)
  baseURL: normalizedBase,
  withCredentials: true,
   
  headers: {
    'Content-Type': 'application/json',
  }
  
});

// Log baseURL for debugging
console.log('🔧 API baseURL configured:', api.defaults.baseURL);
console.log('🔧 Environment:', import.meta.env.MODE);

// Add request interceptor to include token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || 
                  localStorage.getItem('token') ||
                  localStorage.getItem('userToken');
    console.log('🔑 Interceptor - Token found:', token ? 'YES' : 'NO');
    console.log('🔑 Interceptor - Request URL:', config.url);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token added to request:', config.url);
    } else {
      console.warn('⚠️ No token found for request:', config.url);
    }
    
    return config;
  },
  (error) => {
     console.error('❌ Interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 errors globally
    if (error.response?.status === 401) {
      console.error('❌ Unauthorized - clearing tokens');
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('userToken');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
 
  register: async (userData) => {
    try {
      console.log('📤 Sending to:', 'http://localhost:3000/auth/register');
      console.log('📦 Data:', userData);
      
      const response = await api.post('/auth/register', userData);
      console.log('✅ Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Return actual error from backend
      if (error.response?.data) {
        return error.response.data;
      }
      
      return { 
        success: false, 
        message: 'Registration failed. Please try again.' 
      };
    }
  },

  verifyEmail: async (code) => {
    try {
      const response = await api.post('/auth/verifyEmail', { code });
      return response.data;
    } catch (error) {
      console.error('Verify Email Error:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      return { 
        success: false, 
        message: 'Verification failed.' 
      };
    }
  },



login: async (credentials) => {
  try {
    console.log('🔐 Login attempt:', credentials.email);
    
    const response = await api.post('/auth/login', credentials);
    console.log('✅ Login response:', response.data);
    
    // ✅ SUCCESS CASE - Token और user data save करें
    if (response.data.success && response.data.token) {
      // Token save करें
      localStorage.setItem('authToken', response.data.token);
      
      // User data save करें (अगर available है)
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return {
        success: true,
        token: response.data.token,
        user: response.data.user,
        message: response.data.message || 'Login successful'
      };
    }
    
    // ✅ FAILURE CASE
    return {
      success: false,
      message: response.data.message || 'Login failed'
    };
    
  } catch (error) {
    console.error('❌ Login API error:', error);
    
    // Connection refused error
    if (error.code === 'ERR_NETWORK' || error.message.includes('Connection refused')) {
      return {
        success: false,
        message: 'Backend server is not running. Please start the server.'
      };
    }
    
    // Other errors
    if (error.response?.data) {
      return error.response.data;
    }
    
    return {
      success: false,
      message: 'Network error. Please check your connection.'
    };
  }
},

 
checkLogin: async () => {
  try {
    // ✅ token को localStorage से लें
    const token = localStorage.getItem('authToken') || 
                  localStorage.getItem('token') ||
                  localStorage.getItem('userToken');
    
    if (!token) {
      return { loggedIn: false, message: 'No token found' };
    }

    // ✅ token को Authorization header में भेजें
    const response = await api.get('/auth/check-login', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      withCredentials: true
    });
    
    return response.data;
  } catch (error) {
    console.error('Check login error:', error);
    
    // 401 error के case में localStorage clear करें
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('userToken');
      localStorage.removeItem('user');
    }
    
    return { loggedIn: false, message: error.message };
  }
},

  // Logout function
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      // return { success: false, message: 'Logout failed' };
    }
  },
  
  forgotPassword : async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return error.response.data;
      }
      return { 
        success: false, 
        message: 'Request failed' 
      };
    }
  },
   verifyResetOTP: async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-reset-otp', { 
        email, 
        otp 
      });
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return error.response.data;
      }
      return { 
        success: false, 
        message: 'OTP verification failed' 
      };
    }
  },
  
  resetPassword : async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { 
        token, 
        newPassword 
      });
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return error.response.data;
      }
      return { 
        success: false, 
        message: 'Reset failed' 
      };
    }
  },


};

console.log("🔥 CREATE EXAM API HIT");


// api.js में submissions API functions add करें
export const adminAPI = {
  // Get all submissions (admin only)
  getSubmissions: async () => {
    try {
      const response = await api.get('/api/admin/submissions');
      return response.data;
    } catch (error) {
      console.error('Get submissions error:', error);
      
      if (error.response?.status === 401) {
        return { 
          success: false, 
          message: 'Unauthorized. Please login as admin.' 
        };
      }
      
      if (error.response?.status === 403) {
        return { 
          success: false, 
          message: 'Only admin can view submissions.' 
        };
      }
      
      return { 
        success: false, 
        message: 'Failed to load submissions' 
      };
    }
  },

  // Submit exam answers
  submitExam: async (submissionData) => {
    try {
      const response = await api.post('/submissions', submissionData);
      return response.data;
    } catch (error) {
      console.error('Submit exam error:', error);
      return { 
        success: false, 
        message: 'Failed to submit exam' 
      };
    }
  },

  // Get student submissions summary
  getStudentSubmissions: async () => {
    try {
      const response = await api.get('/student-submissions');
      return response.data;
    } catch (error) {
      console.error('Get student submissions error:', error);
      return { 
        success: false, 
        message: 'Failed to load submissions' 
      };
    }
  }
,
  // Delete exam (admin)
  deleteExam: async (examId) => {
    try {
      const response = await api.delete(`/exams/${examId}`);
      return response.data;
    } catch (error) {
      console.error('Delete exam error:', error);
      if (error.response?.status === 401) return { success: false, message: 'Unauthorized' };
      if (error.response?.status === 403) return { success: false, message: 'Forbidden' };
      return { success: false, message: error.response?.data?.message || 'Failed to delete exam' };
    }
  }
};

// api.js में नया function add करें
export const submissionsAPI = {
  getAdminSubmissions: async () => {
    try {
      const response = await api.get('/api/admin/submissions');
      return response.data;
    } catch (error) {
      console.error('Get admin submissions error:', error);
      
      if (error.response?.status === 401) {
        return { 
          success: false, 
          message: 'Unauthorized. Please login as admin.',
          redirectToLogin: true 
        };
      }
      
      if (error.response?.status === 403) {
        return { 
          success: false, 
          message: 'Only admin can view submissions.' 
        };
      }
      
      return { 
        success: false, 
        message: 'Failed to load submissions' 
      };
    }
  },
  
  evaluateSubmission: async (submissionId, obtainedMarks) => {
    try {
      const response = await api.post(`/admin/evaluate/${submissionId}`, {
        obtainedMarks
      });
      return response.data;
    } catch (error) {
      console.error('Evaluate submission error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to evaluate submission' 
      };
    }
  }
};


export default api;


