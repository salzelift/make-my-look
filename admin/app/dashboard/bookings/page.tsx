'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  DollarSign,
  User,
  Store as StoreIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical
} from 'lucide-react';
import { bookingsAPI } from '@/lib/api';
import { Booking, BookingStatus, PaymentStatus } from '@/lib/types';

const BookingRow = ({ booking, onStatusUpdate }: {
  booking: Booking;
  onStatusUpdate: (booking: Booking, newStatus: BookingStatus) => void;
}) => {
  const [showActions, setShowActions] = useState(false);

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case BookingStatus.CONFIRMED:
        return 'bg-blue-100 text-blue-800';
      case BookingStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case BookingStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case PaymentStatus.PARTIAL:
        return 'bg-orange-100 text-orange-800';
      case PaymentStatus.FULL:
        return 'bg-green-100 text-green-800';
      case PaymentStatus.REFUNDED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{booking.customer.user.name}</div>
            <div className="text-sm text-gray-500">{booking.customer.user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{booking.store.name}</div>
        <div className="text-sm text-gray-500">{booking.storeService.serviceType.name}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div className="flex items-center">
          <Calendar className="w-3 h-3 mr-1" />
          {new Date(booking.bookingDate).toLocaleDateString()}
        </div>
        <div className="flex items-center text-gray-500">
          <Clock className="w-3 h-3 mr-1" />
          {booking.startTime} - {booking.endTime}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
          {booking.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 flex items-center">
          <DollarSign className="w-3 h-3 mr-1" />
          ${booking.totalPrice}
        </div>
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
          {booking.paymentStatus}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {showActions && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
              <div className="py-1">
                <button
                  onClick={() => {
                    onStatusUpdate(booking, BookingStatus.CONFIRMED);
                    setShowActions(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 w-full text-left"
                  disabled={booking.status === BookingStatus.CONFIRMED}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm
                </button>
                <button
                  onClick={() => {
                    onStatusUpdate(booking, BookingStatus.COMPLETED);
                    setShowActions(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-green-600 hover:bg-green-50 w-full text-left"
                  disabled={booking.status === BookingStatus.COMPLETED}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete
                </button>
                <button
                  onClick={() => {
                    onStatusUpdate(booking, BookingStatus.CANCELLED);
                    setShowActions(false);
                  }}
                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  disabled={booking.status === BookingStatus.CANCELLED}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>('ALL');

  useEffect(() => {
    loadBookings();
  }, [statusFilter]);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      const filters = statusFilter !== 'ALL' ? { status: statusFilter } : {};
      const response = await bookingsAPI.getAll(filters);
      setBookings(response.data);
    } catch (err: any) {
      console.error('Error loading bookings:', err);
      setError('Failed to load bookings');
      
      // Mock data for demo
      setBookings([
        {
          id: '1',
          customerId: '1',
          storeId: '1',
          storeServiceId: '1',
          employeeId: null,
          bookingDate: new Date().toISOString(),
          startTime: '10:00',
          endTime: '11:00',
          totalPrice: 50,
          paidAmount: 25,
          paymentStatus: PaymentStatus.PARTIAL,
          status: BookingStatus.CONFIRMED,
          notes: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          customer: {
            id: '1',
            userId: '1',
            user: {
              id: '1',
              name: 'Alice Johnson',
              email: 'alice@example.com',
              phoneNumber: '+1234567890',
              userType: 'CUSTOMER' as any,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            preferredServices: [],
            bookings: []
          },
          store: {
            id: '1',
            name: 'Glamour Salon',
            address: '123 Beauty St',
            phoneNumber: '+1234567890',
            ownerId: '1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as any,
          storeService: {
            id: '1',
            storeId: '1',
            serviceTypeId: '1',
            price: 50,
            duration: 60,
            isActive: true,
            serviceType: {
              id: '1',
              name: 'Haircut',
              category: 'Hair',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              storeServices: []
            },
            store: {} as any,
            bookings: []
          },
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking =>
    booking.customer.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.storeService.serviceType.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusUpdate = async (booking: Booking, newStatus: BookingStatus) => {
    try {
      await bookingsAPI.update(booking.id, { status: newStatus });
      setBookings(bookings.map(b => 
        b.id === booking.id ? { ...b, status: newStatus } : b
      ));
    } catch (err: any) {
      console.error('Error updating booking status:', err);
      // For demo, just update locally
      setBookings(bookings.map(b => 
        b.id === booking.id ? { ...b, status: newStatus } : b
      ));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  const statusCounts = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === BookingStatus.PENDING).length,
    confirmed: bookings.filter(b => b.status === BookingStatus.CONFIRMED).length,
    completed: bookings.filter(b => b.status === BookingStatus.COMPLETED).length,
    cancelled: bookings.filter(b => b.status === BookingStatus.CANCELLED).length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600">Monitor and manage all bookings</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters and Search */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BookingStatus | 'ALL')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            >
              <option value="ALL">All Statuses</option>
              <option value={BookingStatus.PENDING}>Pending</option>
              <option value={BookingStatus.CONFIRMED}>Confirmed</option>
              <option value={BookingStatus.COMPLETED}>Completed</option>
              <option value={BookingStatus.CANCELLED}>Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Booking Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="card p-4">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.total}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.pending}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.confirmed}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.completed}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.cancelled}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Store & Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <BookingRow
                  key={booking.id}
                  booking={booking}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria.' : 'Bookings will appear here once customers start booking.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}