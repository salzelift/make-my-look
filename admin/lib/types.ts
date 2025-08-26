// User types
export enum UserType {
  OWNER = 'OWNER',
  CUSTOMER = 'CUSTOMER',
  EMPLOYEE = 'EMPLOYEE',
}

export interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
  userType: UserType;
  createdAt: string;
  updatedAt: string;
  owner?: Owner;
  customer?: Customer;
  employee?: Employee;
}

export interface Owner {
  id: string;
  userId: string;
  user: User;
  stores: Store[];
}

export interface Customer {
  id: string;
  userId: string;
  user: User;
  preferredServices: string[];
  bookings: Booking[];
}

export interface Employee {
  id: string;
  userId: string;
  user: User;
  employeeId: string;
  designation: string;
  hireDate: string;
  salary?: number;
  isActive: boolean;
  storeEmployees: StoreEmployee[];
  bookings: Booking[];
  availability: EmployeeAvailability[];
}

// Store types
export interface Store {
  id: string;
  name: string;
  email?: string;
  address: string;
  phoneNumber?: string;
  latitude?: number;
  longitude?: number;
  ownerId: string;
  owner: Owner;
  createdAt: string;
  updatedAt: string;
  services: StoreService[];
  bookings: Booking[];
  availability: StoreAvailability[];
  storeEmployees: StoreEmployee[];
  employeeAvailability: EmployeeAvailability[];
}

export interface StoreEmployee {
  id: string;
  storeId: string;
  employeeId: string;
  role: string;
  isActive: boolean;
  joinedAt: string;
  leftAt?: string;
  store: Store;
  employee: Employee;
}

// Service types
export interface ServiceType {
  id: string;
  name: string;
  description?: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  storeServices: StoreService[];
}

export interface StoreService {
  id: string;
  storeId: string;
  serviceTypeId: string;
  price: number;
  duration: number;
  description?: string;
  isActive: boolean;
  store: Store;
  serviceType: ServiceType;
  bookings: Booking[];
}

// Availability types
export interface StoreAvailability {
  id: string;
  storeId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  store: Store;
}

export interface EmployeeAvailability {
  id: string;
  employeeId: string;
  storeId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  employee: Employee;
  store: Store;
}

// Booking types
export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  FULL = 'FULL',
  REFUNDED = 'REFUNDED',
}

export interface Booking {
  id: string;
  customerId: string;
  storeId: string;
  storeServiceId: string;
  employeeId?: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
  store: Store;
  storeService: StoreService;
  employee?: Employee;
}

// Analytics types
export interface DashboardStats {
  totalUsers: number;
  totalStores: number;
  totalBookings: number;
  totalRevenue: number;
  recentBookings: Booking[];
  userGrowth: { date: string; count: number }[];
  revenueGrowth: { date: string; amount: number }[];
  popularServices: { service: string; count: number }[];
}

export interface RevenueData {
  period: string;
  total: number;
  data: { date: string; amount: number }[];
}

export interface BookingTrend {
  date: string;
  bookings: number;
  revenue: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface CreateServiceTypeForm {
  name: string;
  description?: string;
  category: string;
}

export interface UpdateUserForm {
  name?: string;
  email?: string;
  phoneNumber?: string;
  isActive?: boolean;
}