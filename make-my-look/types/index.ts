export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  userType: 'OWNER' | 'CUSTOMER';
}

export interface ServiceType {
  id: string;
  name: string;
  description?: string;
  category: string;
}

export interface Store {
  id: string;
  name: string;
  email?: string;
  address: string;
  phoneNumber?: string;
  latitude?: number;
  longitude?: number;
  services: StoreService[];
  availability: StoreAvailability[];
  owner?: {
    user: {
      name: string;
      phoneNumber: string;
    };
  };
  distance?: number;
}

export interface StoreService {
  id: string;
  price: number;
  duration: number;
  description?: string;
  isActive: boolean;
  serviceType: ServiceType;
}

export interface StoreAvailability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface Booking {
  id: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  paidAmount: number;
  paymentStatus: 'PENDING' | 'PARTIAL' | 'FULL' | 'REFUNDED';
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  store: Store;
  storeService: StoreService;
  customer?: {
    user: {
      name: string;
      phoneNumber: string;
      email: string;
    };
  };
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  store?: Store;
}

export interface ApiResponse<T> {
  message?: string;
  error?: string;
  data?: T;
}

export interface SearchFilters {
  query?: string;
  serviceType?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}