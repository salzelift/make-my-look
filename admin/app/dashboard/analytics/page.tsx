'use client';

import React, { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { 
  TrendingUp, 
  TrendingDown,
  Users,
  Store,
  Calendar,
  DollarSign,
  BarChart3,
  RefreshCw,
  Activity
} from 'lucide-react';

interface AnalyticsData {
  analytics: {
    users: Array<{ userType: string; _count: { id: number } }>;
    stores: number;
    bookings: Array<{ status: string; _count: { id: number } }>;
    totalRevenue: number;
    monthlyRevenue: Array<{ month: string; revenue: number }>;
  };
  recentBookings: Array<any>;
  topStores: Array<any>;
}

const AnalyticsPage = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboard();
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Activity className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchAnalyticsData}
            className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Calculate stats
  const totalUsers = data.analytics.users.reduce((sum, user) => sum + user._count.id, 0);
  const totalBookings = data.analytics.bookings.reduce((sum, booking) => sum + booking._count.id, 0);
  
  const pendingBookings = data.analytics.bookings.find(b => b.status === 'PENDING')?._count.id || 0;
  const confirmedBookings = data.analytics.bookings.find(b => b.status === 'CONFIRMED')?._count.id || 0;
  const completedBookings = data.analytics.bookings.find(b => b.status === 'COMPLETED')?._count.id || 0;

  const userTypeStats = data.analytics.users.map(user => ({
    type: user.userType,
    count: user._count.id
  }));

  const bookingStatusStats = data.analytics.bookings.map(booking => ({
    status: booking.status,
    count: booking._count.id
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive platform analytics and insights</p>
        </div>
        <button
          onClick={fetchAnalyticsData}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalUsers.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+12%</span>
              </div>
            </div>
            <div className="p-3 bg-blue-500 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Stores</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{data.analytics.stores.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+5%</span>
              </div>
            </div>
            <div className="p-3 bg-green-500 rounded-lg">
              <Store className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalBookings.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+8%</span>
              </div>
            </div>
            <div className="p-3 bg-purple-500 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">₹{data.analytics.totalRevenue.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+15%</span>
              </div>
            </div>
            <div className="p-3 bg-yellow-500 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Type Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Type Distribution</h3>
          <div className="space-y-4">
            {userTypeStats.map((stat) => (
              <div key={stat.type} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    stat.type === 'CUSTOMER' ? 'bg-blue-500' :
                    stat.type === 'OWNER' ? 'bg-purple-500' :
                    'bg-green-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700">{stat.type}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-bold text-gray-900">{stat.count}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({((stat.count / totalUsers) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status Distribution</h3>
          <div className="space-y-4">
            {bookingStatusStats.map((stat) => (
              <div key={stat.status} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    stat.status === 'COMPLETED' ? 'bg-green-500' :
                    stat.status === 'CONFIRMED' ? 'bg-blue-500' :
                    stat.status === 'PENDING' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700">{stat.status}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-bold text-gray-900">{stat.count}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({((stat.count / totalBookings) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      {data.analytics.monthlyRevenue.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h3>
          <div className="space-y-3">
            {data.analytics.monthlyRevenue.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">
                  {new Date(item.month).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  ₹{item.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Performing Stores */}
      {data.topStores.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Stores</h3>
          <div className="space-y-4">
            {data.topStores.map((store: any, index: number) => (
              <div key={store.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-bold text-gray-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{store.name}</p>
                    <p className="text-xs text-gray-500">{store.owner?.user?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{store._count.bookings} bookings</p>
                  <p className="text-xs text-gray-500">{store.address}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {data.recentBookings.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
          <div className="space-y-3">
            {data.recentBookings.slice(0, 5).map((booking: any) => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {booking.customer?.user?.name || 'Unknown Customer'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {booking.store?.name} • {booking.storeService?.serviceType?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">₹{booking.totalPrice}</p>
                  <p className={`text-xs px-2 py-1 rounded-full inline-block ${
                    booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                    booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {booking.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;