'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import { analyticsAPI } from '@/lib/api';

const MetricCard = ({ title, value, change, changeType, icon: Icon }: {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative';
  icon: any;
}) => (
  <div className="card p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <div className={`flex items-center mt-2 text-sm ${
            changeType === 'positive' ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`w-4 h-4 mr-1 ${
              changeType === 'negative' ? 'rotate-180' : ''
            }`} />
            <span>{change}</span>
          </div>
        )}
      </div>
      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
        <Icon className="w-6 h-6 text-gray-600" />
      </div>
    </div>
  </div>
);

const SimpleBarChart = ({ data, title }: {
  data: { label: string; value: number }[];
  title: string;
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">{item.label}</span>
              <span className="font-medium text-gray-900">{item.value}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-black h-2 rounded-full transition-all duration-300"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TopPerformers = ({ type, data }: {
  type: 'stores' | 'services';
  data: { name: string; value: number; subtitle?: string }[];
}) => (
  <div className="card p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">
      Top {type === 'stores' ? 'Performing Stores' : 'Popular Services'}
    </h3>
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-sm font-medium text-gray-600">{index + 1}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{item.name}</p>
              {item.subtitle && (
                <p className="text-xs text-gray-500">{item.subtitle}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {type === 'stores' ? `$${item.value.toLocaleString()}` : `${item.value} bookings`}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [timePeriod, setTimePeriod] = useState('30d');
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    loadAnalyticsData();
  }, [timePeriod]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      // In a real app, these would be separate API calls
      const [dashboardResponse] = await Promise.all([
        analyticsAPI.getDashboard(),
      ]);
      
      setDashboardData(dashboardResponse.data);
    } catch (err: any) {
      console.error('Error loading analytics data:', err);
      setError('Failed to load analytics data');
      
      // Mock data for demo
      setDashboardData({
        totalRevenue: 125890,
        totalBookings: 3456,
        totalUsers: 1247,
        averageBookingValue: 36.42,
        revenueGrowth: '+23%',
        bookingGrowth: '+18%',
        userGrowth: '+12%',
        avgValueGrowth: '+8%'
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

  const revenueData = [
    { label: 'January', value: 12500 },
    { label: 'February', value: 15800 },
    { label: 'March', value: 18200 },
    { label: 'April', value: 22100 },
    { label: 'May', value: 19900 },
    { label: 'June', value: 25400 },
  ];

  const bookingTrendsData = [
    { label: 'Hair Services', value: 234 },
    { label: 'Facial Treatments', value: 189 },
    { label: 'Nail Services', value: 156 },
    { label: 'Body Treatments', value: 134 },
    { label: 'Beauty Services', value: 98 },
  ];

  const topStores = [
    { name: 'Glamour Salon', value: 15420, subtitle: '89 bookings this month' },
    { name: 'Beauty Hub', value: 12890, subtitle: '76 bookings this month' },
    { name: 'Style Studio', value: 10750, subtitle: '65 bookings this month' },
    { name: 'Wellness Spa', value: 9680, subtitle: '58 bookings this month' },
    { name: 'Luxury Lounge', value: 8920, subtitle: '52 bookings this month' },
  ];

  const topServices = [
    { name: 'Haircut & Styling', value: 234 },
    { name: 'Facial Treatment', value: 189 },
    { name: 'Manicure & Pedicure', value: 156 },
    { name: 'Hair Coloring', value: 134 },
    { name: 'Deep Tissue Massage', value: 98 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600">Track your platform's performance and insights</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
          
          <button className="btn-primary flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`$${dashboardData?.totalRevenue?.toLocaleString()}`}
          change={dashboardData?.revenueGrowth}
          changeType="positive"
          icon={DollarSign}
        />
        <MetricCard
          title="Total Bookings"
          value={dashboardData?.totalBookings?.toLocaleString()}
          change={dashboardData?.bookingGrowth}
          changeType="positive"
          icon={Calendar}
        />
        <MetricCard
          title="Active Users"
          value={dashboardData?.totalUsers?.toLocaleString()}
          change={dashboardData?.userGrowth}
          changeType="positive"
          icon={Users}
        />
        <MetricCard
          title="Avg. Booking Value"
          value={`$${dashboardData?.averageBookingValue}`}
          change={dashboardData?.avgValueGrowth}
          changeType="positive"
          icon={BarChart3}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleBarChart
          data={revenueData}
          title="Monthly Revenue Trend"
        />
        <SimpleBarChart
          data={bookingTrendsData}
          title="Service Category Performance"
        />
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopPerformers
          type="stores"
          data={topStores}
        />
        <TopPerformers
          type="services"
          data={topServices}
        />
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Insights</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Average Customer Lifetime</span>
              <span className="font-medium">8.5 months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Customer Retention Rate</span>
              <span className="font-medium">78%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Bookings per Customer</span>
              <span className="font-medium">4.2</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Average Store Rating</span>
              <span className="font-medium">4.7/5.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Store Utilization Rate</span>
              <span className="font-medium">73%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Service Duration</span>
              <span className="font-medium">65 minutes</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Health</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Platform Commission</span>
              <span className="font-medium">$8,450</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Success Rate</span>
              <span className="font-medium">97.8%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Refund Rate</span>
              <span className="font-medium">2.1%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}