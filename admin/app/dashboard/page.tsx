'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Store, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Clock
} from 'lucide-react';
import { analyticsAPI } from '@/lib/api';
import { DashboardStats } from '@/lib/types';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue 
}: {
  title: string;
  value: string | number;
  icon: any;
  trend?: 'up' | 'down';
  trendValue?: string;
}) => (
  <div className="card p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && trendValue && (
          <div className={`flex items-center mt-2 text-sm ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
        <Icon className="w-6 h-6 text-gray-600" />
      </div>
    </div>
  </div>
);

const RecentActivity = ({ activities }: { activities: any[] }) => (
  <div className="card p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-center">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
            <Activity className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-900">{activity.description}</p>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <Clock className="w-3 h-3 mr-1" />
              {activity.timestamp}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await analyticsAPI.getDashboard();
      setStats(response.data);
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
      
      // Mock data for demo purposes
      setStats({
        totalUsers: 1247,
        totalStores: 89,
        totalBookings: 3456,
        totalRevenue: 125890,
        recentBookings: [],
        userGrowth: [],
        revenueGrowth: [],
        popularServices: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  const mockActivities = [
    {
      description: 'New customer registration: Sarah Johnson',
      timestamp: '2 minutes ago'
    },
    {
      description: 'Booking confirmed at Glamour Salon',
      timestamp: '15 minutes ago'
    },
    {
      description: 'New store registered: Beauty Hub',
      timestamp: '1 hour ago'
    },
    {
      description: 'Payment received: $150',
      timestamp: '2 hours ago'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Monitor your salon booking platform performance</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers?.toLocaleString() || '0'}
          icon={Users}
          trend="up"
          trendValue="+12% from last month"
        />
        <StatCard
          title="Active Stores"
          value={stats?.totalStores?.toLocaleString() || '0'}
          icon={Store}
          trend="up"
          trendValue="+5% from last month"
        />
        <StatCard
          title="Total Bookings"
          value={stats?.totalBookings?.toLocaleString() || '0'}
          icon={Calendar}
          trend="up"
          trendValue="+18% from last month"
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats?.totalRevenue?.toLocaleString() || '0'}`}
          icon={DollarSign}
          trend="up"
          trendValue="+23% from last month"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">89%</p>
                <p className="text-sm text-gray-600">Customer Satisfaction</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">156</p>
                <p className="text-sm text-gray-600">Today's Bookings</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">$12,450</p>
                <p className="text-sm text-gray-600">Today's Revenue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <RecentActivity activities={mockActivities} />
        </div>
      </div>

      {/* Popular Services */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { name: 'Haircut & Styling', bookings: 234 },
            { name: 'Facial Treatment', bookings: 189 },
            { name: 'Manicure & Pedicure', bookings: 156 },
            { name: 'Hair Coloring', bookings: 134 }
          ].map((service, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900">{service.name}</p>
              <p className="text-sm text-gray-600">{service.bookings} bookings</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}