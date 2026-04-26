// src/context/AuthContext.jsx
// Global authentication context — provides user state to all components

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

// Create the context
const AuthContext = createContext(null);

/**
 * AuthProvider wraps the entire app and provides:
 * - user: current logged-in user object (null if not logged in)
 * - token: JWT token string
 * - login(email, password): login function
 * - register(data): register function
 * - logout(): clear auth state
 * - loading: whether initial auth check is running
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Checking local storage on mount

  // On app load — restore user from localStorage if token exists
  useEffect(() => {
    const storedUser = localStorage.getItem('pawcare_user');
    const storedToken = localStorage.getItem('pawcare_token');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // If JSON parse fails, clear storage
        localStorage.removeItem('pawcare_user');
        localStorage.removeItem('pawcare_token');
      }
    }
    setLoading(false);
  }, []);

  /**
   * Login with email and password
   * Returns { success, error }
   */
  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('pawcare_token', data.token);
      localStorage.setItem('pawcare_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  };

  /**
   * Register a new account
   */
  const register = async (formData) => {
    try {
      const { data } = await api.post('/auth/register', formData);
      localStorage.setItem('pawcare_token', data.token);
      localStorage.setItem('pawcare_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  /**
   * Logout — clear all auth state
   */
  const logout = () => {
    localStorage.removeItem('pawcare_token');
    localStorage.removeItem('pawcare_user');
    setUser(null);
  };

  /**
   * Check if current user has a specific role
   */
  const hasRole = (...roles) => user && roles.includes(user.role);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy context consumption
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
