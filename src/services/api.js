import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Chỉ redirect khi 401 và KHÔNG phải là request login
    if (error.response?.status === 401 && !error.config.url?.includes('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/admin';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }),
  
  requestReset: (email, newPassword, confirmPassword) =>
    api.post('/auth/request-reset', {
      email,
      new_password: newPassword,
      confirm_password: confirmPassword,
    }),
  
  verifyReset: (email, otpCode) =>
    api.post('/auth/verify-reset', { email, otp_code: otpCode }),
};

// Key Management APIs
export const keyAPI = {
  create: (type, note) =>
    api.post('/keys/create', { type, note }),
  
  list: () =>
    api.get('/keys/list'),
  
  get: (keyValue) =>
    api.get(`/keys/${keyValue}`),
  
  update: (keyValue, data) =>
    api.put(`/keys/${keyValue}`, data),
  
  delete: (keyValue) =>
    api.delete(`/keys/${keyValue}`),
};

export default api;
