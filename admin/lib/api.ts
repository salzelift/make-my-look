import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on auth failure
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (data: any) =>
    api.post('/auth/register/admin', data),
};

// Users API
export const usersAPI = {
  getAll: (userType?: string) => {
    const params = userType ? { userType } : {};
    return api.get('/admin/users', { params });
  },
  
  getById: (id: string) =>
    api.get(`/admin/users/${id}`),
  
  update: (id: string, data: any) =>
    api.put(`/admin/users/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/admin/users/${id}`),
  
  getStats: () =>
    api.get('/admin/users/stats'),
};

// Stores API
export const storesAPI = {
  getAll: () =>
    api.get('/admin/stores'),
  
  getById: (id: string) =>
    api.get(`/admin/stores/${id}`),
  
  update: (id: string, data: any) =>
    api.put(`/admin/stores/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/admin/stores/${id}`),
  
  getStats: () =>
    api.get('/admin/stores/stats'),
};

// Bookings API
export const bookingsAPI = {
  getAll: (filters?: any) =>
    api.get('/admin/bookings', { params: filters }),
  
  getById: (id: string) =>
    api.get(`/admin/bookings/${id}`),
  
  update: (id: string, data: any) =>
    api.put(`/admin/bookings/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/admin/bookings/${id}`),
  
  getStats: () =>
    api.get('/admin/bookings/stats'),
  
  getRevenue: (period?: string) =>
    api.get('/admin/bookings/revenue', { params: { period } }),
};

// Services API
export const servicesAPI = {
  getTypes: () =>
    api.get('/services/types'),
  
  createType: (data: any) =>
    api.post('/admin/services/types', data),
  
  updateType: (id: string, data: any) =>
    api.put(`/admin/services/types/${id}`, data),
  
  deleteType: (id: string) =>
    api.delete(`/admin/services/types/${id}`),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () =>
    api.get('/admin/analytics/dashboard'),
  
  getRevenue: (period: string) =>
    api.get('/admin/analytics/revenue', { params: { period } }),
  
  getBookingTrends: (period: string) =>
    api.get('/admin/analytics/booking-trends', { params: { period } }),
  
  getPopularServices: () =>
    api.get('/admin/analytics/popular-services'),
};

export default api;