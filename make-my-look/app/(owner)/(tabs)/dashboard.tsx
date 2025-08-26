import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { ownersAPI } from '@/services/api';
import { 
  BarChart3, 
  Store, 
  Calendar, 
  DollarSign, 
  Plus, 
  Eye, 
  TrendingUp, 
  Users, 
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  LogOut
} from 'lucide-react-native';

interface DashboardStats {
  totalStores: number;
  totalBookings: number;
  todayBookings: number;
  totalRevenue: number;
}

export default function OwnerDashboardScreen() {
  const { user, isAuthenticated, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/welcome');
      return;
    }

    if (user?.userType !== 'OWNER') {
      router.replace('/(customer)/(tabs)');
      return;
    }

    loadDashboardData();
  }, [isAuthenticated, user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await ownersAPI.getDashboard();
      setStats(response.stats);
      setRecentBookings(response.recentBookings);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return { bg: 'bg-success-100', text: 'text-success-700', icon: CheckCircle };
      case 'PENDING':
        return { bg: 'bg-warning-100', text: 'text-warning-700', icon: Clock };
      case 'COMPLETED':
        return { bg: 'bg-primary-100', text: 'text-primary-700', icon: CheckCircle };
      default:
        return { bg: 'bg-error-100', text: 'text-error-700', icon: XCircle };
    }
  };

  if (!isAuthenticated || user?.userType !== 'OWNER') {
    return null; // Will redirect
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-8">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-8">
            <View>
              <Text style={{ color: textColor }} className="text-3xl font-bold mb-2">
                Dashboard
              </Text>
              <Text style={{ color: textColor }} className="text-base opacity-70">
                Welcome back, {user?.name}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={logout}
              className="flex-row items-center bg-gray-100 px-4 py-2 rounded-full"
            >
              <LogOut size={16} color={textColor} />
              <Text style={{ color: textColor }} className="text-sm font-medium ml-2">
                Logout
              </Text>
            </TouchableOpacity>
          </View>

          {/* Stats Cards */}
          {loading ? (
            <Loading text="Loading your dashboard..." />
          ) : (
            <>
              <View className="grid grid-cols-2 gap-4 mb-8">
                <Card variant="elevated">
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text style={{ color: textColor }} className="text-2xl font-bold mb-1">
                        {stats?.totalStores || 0}
                      </Text>
                      <Text style={{ color: textColor }} className="text-sm opacity-70">
                        Total Stores
                      </Text>
                    </View>
                    <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center">
                      <Store size={24} color="#475569" />
                    </View>
                  </View>
                </Card>

                <Card variant="elevated">
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text style={{ color: textColor }} className="text-2xl font-bold mb-1">
                        {stats?.todayBookings || 0}
                      </Text>
                      <Text style={{ color: textColor }} className="text-sm opacity-70">
                        Today's Bookings
                      </Text>
                    </View>
                    <View className="w-12 h-12 bg-accent-100 rounded-full items-center justify-center">
                      <Calendar size={24} color="#F2751A" />
                    </View>
                  </View>
                </Card>

                <Card variant="elevated">
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text style={{ color: textColor }} className="text-2xl font-bold mb-1">
                        {stats?.totalBookings || 0}
                      </Text>
                      <Text style={{ color: textColor }} className="text-sm opacity-70">
                        Total Bookings
                      </Text>
                    </View>
                    <View className="w-12 h-12 bg-success-100 rounded-full items-center justify-center">
                      <Users size={24} color="#22C55E" />
                    </View>
                  </View>
                </Card>

                <Card variant="elevated">
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text style={{ color: textColor }} className="text-2xl font-bold mb-1">
                        ${stats?.totalRevenue?.toFixed(2) || '0.00'}
                      </Text>
                      <Text style={{ color: textColor }} className="text-sm opacity-70">
                        Total Revenue
                      </Text>
                    </View>
                    <View className="w-12 h-12 bg-warning-100 rounded-full items-center justify-center">
                      <DollarSign size={24} color="#F59E0B" />
                    </View>
                  </View>
                </Card>
              </View>

              {/* Quick Actions */}
              <Card variant="elevated" style={{ marginBottom: 24 }}>
                <Text style={{ color: textColor }} className="text-xl font-bold mb-6">
                  Quick Actions
                </Text>
                <View className="space-y-4">
                  <Button
                    title="Manage Stores"
                    onPress={() => router.push('/(owner)/(tabs)/stores')}
                    variant="outline"
                    size="large"
                    icon="🏪"
                  />
                  <Button
                    title="View Bookings"
                    onPress={() => router.push('/(owner)/(tabs)/bookings')}
                    variant="outline"
                    size="large"
                    icon="📅"
                  />
                  <Button
                    title="Add New Store"
                    onPress={() => router.push('/(owner)/(tabs)/stores')}
                    variant="primary"
                    size="large"
                    icon="➕"
                  />
                </View>
              </Card>

              {/* Recent Bookings */}
              <Card variant="elevated">
                <View className="flex-row items-center justify-between mb-6">
                  <Text style={{ color: textColor }} className="text-xl font-bold">
                    Recent Bookings
                  </Text>
                  <TouchableOpacity>
                    <Text style={{ color: textColor }} className="text-sm font-medium text-primary-600">
                      View All
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {recentBookings.length === 0 ? (
                  <View className="items-center py-8">
                    <Calendar size={48} color="#9CA3AF" />
                    <Text style={{ color: textColor }} className="text-lg font-semibold mt-4 mb-2">
                      No recent bookings
                    </Text>
                    <Text style={{ color: textColor }} className="text-base opacity-70 text-center">
                      New bookings will appear here
                    </Text>
                  </View>
                ) : (
                  <View className="space-y-4">
                    {recentBookings.slice(0, 5).map((booking: any) => {
                      const statusConfig = getStatusColor(booking.status);
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <View key={booking.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                          <View className="flex-row justify-between items-start">
                            <View className="flex-1">
                              <View className="flex-row items-center mb-2">
                                <Text style={{ color: textColor }} className="font-semibold text-base">
                                  {booking.customer.user.name}
                                </Text>
                                <View className={`ml-3 px-2 py-1 rounded-full ${statusConfig.bg}`}>
                                  <View className="flex-row items-center">
                                    <StatusIcon size={12} color={statusConfig.text} />
                                    <Text className={`text-xs font-semibold ml-1 ${statusConfig.text}`}>
                                      {booking.status}
                                    </Text>
                                  </View>
                                </View>
                              </View>
                              
                              <Text style={{ color: textColor }} className="text-sm opacity-70 mb-1">
                                {booking.storeService.serviceType.name} • {booking.store.name}
                              </Text>
                              
                              <Text style={{ color: textColor }} className="text-sm opacity-70">
                                {new Date(booking.bookingDate).toLocaleDateString()} at {booking.startTime}
                              </Text>
                            </View>
                            
                            <TouchableOpacity className="ml-4">
                              <Eye size={20} color={textColor} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </Card>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}