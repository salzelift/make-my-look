export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  userType: 'OWNER' | 'CUSTOMER' | 'EMPLOYEE';
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

export interface Employee {
  id: string;
  employeeId: string;
  designation: string;
  hireDate: string;
  salary?: number;
  isActive: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
}

export interface StoreEmployee {
  id: string;
  role: string;
  isActive: boolean;
  joinedAt: string;
  leftAt?: string;
  employee: Employee;
}

export interface EmployeeAvailability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface EmployeeStats {
  employeeId: string;
  employeeName: string;
  period: {
    startDate?: string;
    endDate?: string;
  };
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  completionRate: number;
  totalRevenue: number;
  averageRevenue: number;
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
  employeeId?: string;
  store: Store;
  storeService: StoreService;
  customer?: {
    user: {
      name: string;
      phoneNumber: string;
      email: string;
    };
  };
  employee?: {
    user: {
      name: string;
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

export interface BankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  accountType: string;
  accountHolderName: string;
  ownerId: string;
}

export interface PaymentPayout {
  id: string;
  amount: number;
  status: 'PENDING' | 'PAIDOUT';
  createdAt: string;
  updatedAt: string;
  paidBy: {
    user: {
      name: string;
      email: string;
      phoneNumber: string;
    };
  };
}

export interface Customer {
  id: string;
  userId: string;
  preferredServices: string[];
  ownerId?: string;
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
  owner?: {
    id: string;
    ownerCode: string;
    user: {
      name: string;
    };
  };
  preferredServiceTypes?: ServiceType[];
}

export interface Owner {
  id: string;
  userId: string;
  ownerCode: string;
  razorpayAccountId?: string;
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
  stores?: Store[];
}