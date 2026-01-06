

import jwt from "jsonwebtoken";
import { Usermodel } from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    // ✅ Debug log
    console.log('🔍 Auth middleware - Token from cookie:', token ? 'Present' : 'Not found');
    console.log('🔍 Auth middleware - Headers:', req.headers);

    if (!token && req.headers.authorization) {
      token = req.headers.authorization.replace("Bearer ", "");
    }

    if (!token) {
      console.log('❌ No token found');
      return res.status(401).json({ 
        loggedIn: false,
        message: 'No authentication token found'
      });
    }

    // ✅ Verify token with better error handling
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded:', decoded);

    const user = await Usermodel.findById(decoded.userId).select("-password");

    if (!user) {
      console.log('❌ User not found in database');
      return res.status(401).json({ 
        loggedIn: false,
        message: 'User not found' 
      });
    }

    // ✅ Full user object
    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    };

    console.log('✅ User authenticated:', req.user.email);
    next();
    
  } catch (error) {
    console.error('❌ Auth middleware error:', {
      name: error.name,
      message: error.message,
      token: req.cookies?.token ? 'Present' : 'Not found'
    });
    
    // ✅ Better error responses
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        loggedIn: false,
        message: 'Invalid token format'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        loggedIn: false,
        message: 'Token expired'
      });
    }
    
    return res.status(401).json({ 
      loggedIn: false,
      message: 'Authentication failed'
    });
  }
};






// Add these helper functions after authMiddleware
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      loggedIn: false,
      message: 'Authentication required' 
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Admin access required' 
    });
  }
  
  next();
};

export const isStudent = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      loggedIn: false,
      message: 'Authentication required' 
    });
  }
  
  if (req.user.role !== 'student') {
    return res.status(403).json({ 
      success: false,
      message: 'Student access required' 
    });
  }
  
  next();
};

export const isTeacher = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      loggedIn: false,
      message: 'Authentication required' 
    });
  }
  
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ 
      success: false,
      message: 'Teacher access required' 
    });
  }
  
  next();
};

// Combined middleware for multiple roles
export const requireRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        loggedIn: false,
        message: 'Authentication required' 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: `Required roles: ${roles.join(', ')}` 
      });
    }
    
    next();
  };
};

export default authMiddleware;

