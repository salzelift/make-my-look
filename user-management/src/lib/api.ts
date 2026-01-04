import axios from 'axios';

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    userType: 'CUSTOMER' | 'OWNER';
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  userType: 'CUSTOMER' | 'OWNER';
}

export const authAPI = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/forgot-password', { email });
    return response.data;
  },

  verifyOTP: async (email: string, otp: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/verify-otp', { email, otp });
    return response.data;
  },

  resetPassword: async (email: string, otp: string, newPassword: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/reset-password', {
      email,
      otp,
      newPassword,
    });
    return response.data;
  },

  deleteUser: async (): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>('/auth/user');
    return response.data;
  },
};

export default api;

