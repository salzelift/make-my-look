import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, User, Store, ServiceType, Booking, TimeSlot, SearchFilters } from '@/types';

const API_BASE_URL = 'http://172.29.40.148:8001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  registerOwner: async (data: {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    ownerCode: string;
    store: {
      storeName: string;
      storeEmail?: string;
      storeAddress: string;
      storePhoneNumber?: string;
      latitude?: number;
      longitude?: number;
      serviceIds: string[];
    };
  }): Promise<AuthResponse> => {
    const response = await api.post('/auth/register/owner', data);
    console.log(response);
    return response.data;
  },

  registerCustomer: async (data: {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    preferredServices?: string[];
  }): Promise<AuthResponse> => {
    const response = await api.post('/auth/register/customer', data);
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
};

// Services API
export const servicesAPI = {
  getServiceTypes: async (): Promise<{ services: ServiceType[]; groupedServices: Record<string, ServiceType[]> }> => {
    const response = await api.get('/services/types');
    return response.data;
  },
};

// Stores API
export const storesAPI = {
  getAllStores: async (filters?: SearchFilters): Promise<{ stores: Store[] }> => {
    const response = await api.get('/stores', { params: filters });
    return response.data;
  },

  getStoreById: async (storeId: string): Promise<{ store: Store }> => {
    const response = await api.get(`/stores/${storeId}`);
    return response.data;
  },

  getMyStores: async (): Promise<{ stores: Store[] }> => {
    const response = await api.get('/stores/owner/my-stores');
    return response.data;
  },

  createStore: async (data: {
    name: string;
    email?: string;
    address: string;
    phoneNumber?: string;
    latitude?: number;
    longitude?: number;
    serviceIds: string[];
  }): Promise<{ store: Store }> => {
    const response = await api.post('/stores', data);
    return response.data;
  },

  updateStoreService: async (storeId: string, serviceId: string, data: {
    price?: number;
    duration?: number;
    description?: string;
    isActive?: boolean;
  }) => {
    const response = await api.put(`/stores/${storeId}/services/${serviceId}`, data);
    return response.data;
  },

  setStoreAvailability: async (storeId: string, availability: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>) => {
    const response = await api.post(`/stores/${storeId}/availability`, { availability });
    return response.data;
  },
};

// Bookings API
export const bookingsAPI = {
  createBooking: async (data: {
    storeId: string;
    storeServiceId: string;
    bookingDate: string;
    startTime: string;
    paymentPercentage: 0 | 50 | 100;
    notes?: string;
  }): Promise<{ booking: Booking }> => {
    const response = await api.post('/bookings', data);
    return response.data;
  },

  getMyBookings: async (): Promise<{ bookings: Booking[] }> => {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  },

  getStoreBookings: async (storeId: string, filters?: {
    date?: string;
    status?: string;
  }): Promise<{ bookings: Booking[] }> => {
    const response = await api.get(`/bookings/store/${storeId}`, { params: filters });
    return response.data;
  },

  updateBookingStatus: async (bookingId: string, status: string) => {
    const response = await api.patch(`/bookings/${bookingId}/status`, { status });
    return response.data;
  },

  cancelBooking: async (bookingId: string) => {
    const response = await api.delete(`/bookings/${bookingId}`);
    return response.data;
  },

  getAvailableSlots: async (storeId: string, serviceId: string, date: string): Promise<{ availableSlots: TimeSlot[] }> => {
    const response = await api.get(`/bookings/availability/${storeId}/${serviceId}/${date}`);
    return response.data;
  },
};

// Payments API
export const paymentsAPI = {
  createOrder: async (data: {
    amount: number;
    currency?: string;
    bookingId?: string;
  }) => {
    const response = await api.post('/payments/create-order', data);
    return response.data;
  },

  verifyPayment: async (data: {
    orderId: string;
    paymentId: string;
    signature: string;
    bookingId?: string;
  }) => {
    const response = await api.post('/payments/verify-payment', data);
    return response.data;
  },

  processPayment: async (bookingId: string, data: {
    paymentMethod: string;
    paymentAmount: number;
  }) => {
    const response = await api.post(`/payments/booking/${bookingId}`, data);
    return response.data;
  },

  getPaymentStatus: async (bookingId: string) => {
    const response = await api.get(`/payments/booking/${bookingId}/status`);
    return response.data;
  },
};

// Employees API
export const employeesAPI = {
  getStoreEmployees: async (storeId: string, filters?: {
    status?: string;
    role?: string;
  }) => {
    const response = await api.get(`/employees/store/${storeId}`, { params: filters });
    return response.data;
  },

  addEmployee: async (storeId: string, data: {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    designation: string;
    role: string;
    salary?: number;
    employeeId?: string;
  }) => {
    const response = await api.post(`/employees/store/${storeId}`, data);
    return response.data;
  },

  updateEmployee: async (employeeId: string, data: {
    name?: string;
    email?: string;
    phoneNumber?: string;
    designation?: string;
    role?: string;
    salary?: number;
    isActive?: boolean;
  }) => {
    const response = await api.put(`/employees/${employeeId}`, data);
    return response.data;
  },

  removeEmployee: async (storeId: string, employeeId: string) => {
    const response = await api.delete(`/employees/store/${storeId}/employee/${employeeId}`);
    return response.data;
  },

  setEmployeeAvailability: async (employeeId: string, data: {
    storeId: string;
    availability: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isActive?: boolean;
    }>;
  }) => {
    const response = await api.post(`/employees/${employeeId}/availability`, data);
    return response.data;
  },

  getEmployeeAvailability: async (employeeId: string, storeId: string) => {
    const response = await api.get(`/employees/${employeeId}/availability/${storeId}`);
    return response.data;
  },

  getEmployeeStats: async (employeeId: string, storeId: string, filters?: {
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get(`/employees/${employeeId}/stats/${storeId}`, { params: filters });
    return response.data;
  },
};

// Customers API
export const customersAPI = {
  getProfile: async () => {
    const response = await api.get('/customers/profile');
    return response.data;
  },

  updateProfile: async (data: {
    name?: string;
    phoneNumber?: string;
    preferredServices?: string[];
  }) => {
    const response = await api.put('/customers/profile', data);
    return response.data;
  },

  searchStores: async (filters: SearchFilters): Promise<{ stores: Store[] }> => {
    const response = await api.get('/customers/search', { params: filters });
    return response.data;
  },

  enterOwnerCode: async (ownerCode: string, customerId: string) => {
    const response = await api.post('/auth/customer/enter-owner-code', { ownerCode, customerId });
    return response.data;
  },

  changeOwnerCode: async (ownerCode: string) => {
    const response = await api.post('/customers/change-owner-code', { ownerCode });
    return response.data;
  },
};

// Owners API
export const ownersAPI = {
  getProfile: async () => {
    const response = await api.get('/owners/profile');
    return response.data;
  },

  updateProfile: async (data: {
    name?: string;
    phoneNumber?: string;
  }) => {
    const response = await api.put('/owners/profile', data);
    return response.data;
  },

  getDashboard: async () => {
    const response = await api.get('/owners/dashboard');
    return response.data;
  },

  createBankAccount: async (data: {
    accountName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branchName: string;
    accountType: string;
    accountHolderName: string;
  }) => {
    const response = await api.post('/owners/create-bank-account', data);
    return response.data;
  },

  getBankAccount: async () => {
    const response = await api.get('/owners/bank-account');
    return response.data;
  },

  getPaymentPayouts: async () => {
    const response = await api.get('/owners/payment-payouts');
    return response.data;
  },

  getOwnerCode: async () => {
    const response = await api.get('/owners/owner-code');
    return response.data;
  },
};

export default api;