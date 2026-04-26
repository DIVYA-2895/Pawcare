// src/api/axios.js
// Centralized Axios instance with base URL and JWT interceptors

import axios from 'axios';

// Base URL for all API calls
const API_BASE = 'https://pawcare-y084.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — automatically attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pawcare_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 (token expired/invalid)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('pawcare_token');
      localStorage.removeItem('pawcare_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
