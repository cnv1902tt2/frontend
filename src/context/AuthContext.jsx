import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

// Utility function to clear all browser caches
const clearAllCaches = async () => {
  try {
    // Clear Cache Storage (Service Worker caches)
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('Cache Storage cleared');
    }

    // Unregister Service Workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(registration => registration.unregister())
      );
      console.log('Service Workers unregistered');
    }

    // Clear localStorage (except essential items if needed)
    localStorage.clear();
    console.log('LocalStorage cleared');

    // Clear sessionStorage
    sessionStorage.clear();
    console.log('SessionStorage cleared');

    return true;
  } catch (error) {
    console.error('Error clearing caches:', error);
    return false;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authAPI.login(username, password);
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      const userData = { username };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Đăng nhập thất bại',
      };
    }
  };

  const logout = async (clearCache = false) => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    
    if (clearCache) {
      await clearAllCaches();
      // Force reload to get fresh content
      window.location.href = '/admin';
    }
  };

  const requestPasswordReset = async (email, newPassword, confirmPassword) => {
    try {
      const response = await authAPI.requestReset(email, newPassword, confirmPassword);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Gửi OTP không thành công',
      };
    }
  };

  const verifyPasswordReset = async (email, otpCode) => {
    try {
      const response = await authAPI.verifyReset(email, otpCode);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Xác thực OTP thất bại',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        requestPasswordReset,
        verifyPasswordReset,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }
  return context;
};
