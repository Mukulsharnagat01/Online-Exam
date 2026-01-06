


import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api'; 

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Get user from cookies on app load
  const getUserFromCookie = async () => {
    try {
      const result = await authAPI.checkLogin();
      console.log('Cookie check result:', result);
      
      if (result?.loggedIn && result?.user) {
        setUser(result.user);
        console.log('User from cookie:', result.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Cookie check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // ✅ On initial load, check cookie
    getUserFromCookie();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const result = await authAPI.login({ email, password });
      console.log('📦 Login result in AuthContext:', result);
      
      if (result.success && result.user) {
        // ✅ Token और user data already saved in api.js
        // सिर्फ state update करें
        setUser(result.user);
        setLoading(false);
        return { success: true, user: result.user };
      } else {
        setLoading(false);
        return { success: false, message: result.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // ✅ Clear state
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    refreshUser: getUserFromCookie // ✅ Add refresh function
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};