import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ownersAPI } from '@/services/api';

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
      router.replace('/(tabs)/');
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

  if (!isAuthenticated || user?.userType !== 'OWNER') {
    return null; // Will redirect
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-8">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-8">
            <View>
              <Text style={{ color: textColor }} className="text-3xl font-bold mb-1">
                Dashboard
              </Text>
              <Text style={{ color: textColor }} className="text-base opacity-70">
                Welcome back, {user?.name}
              </Text>
            </View>
            <TouchableOpacity onPress={logout}>
              <Text style={{ color: textColor }} className="text-base underline">
                Logout
              </Text>
            </TouchableOpacity>
          </View>

          {/* Stats Cards */}
          {loading ? (
            <View className="py-8">
              <Text style={{ color: textColor }} className="text-center opacity-70">
                Loading dashboard...
              </Text>
            </View>
          ) : (
            <>
              <View className="grid grid-cols-2 gap-4 mb-6">
                <Card>
                  <Text style={{ color: textColor }} className="text-2xl font-bold mb-1">
                    {stats?.totalStores || 0}
                  </Text>
                  <Text style={{ color: textColor }} className="text-sm opacity-70">
                    Total Stores
                  </Text>
                </Card>

                <Card>
                  <Text style={{ color: textColor }} className="text-2xl font-bold mb-1">
                    {stats?.todayBookings || 0}
                  </Text>
                  <Text style={{ color: textColor }} className="text-sm opacity-70">
                    Today's Bookings
                  </Text>
                </Card>

                <Card>
                  <Text style={{ color: textColor }} className="text-2xl font-bold mb-1">
                    {stats?.totalBookings || 0}
                  </Text>
                  <Text style={{ color: textColor }} className="text-sm opacity-70">
                    Total Bookings
                  </Text>
                </Card>

                <Card>
                  <Text style={{ color: textColor }} className="text-2xl font-bold mb-1">
                    ${stats?.totalRevenue?.toFixed(2) || '0.00'}
                  </Text>
                  <Text style={{ color: textColor }} className="text-sm opacity-70">
                    Total Revenue
                  </Text>
                </Card>
              </View>

              {/* Quick Actions */}
              <Card style={{ marginBottom: 24 }}>
                <Text style={{ color: textColor }} className="text-xl font-bold mb-4">
                  Quick Actions
                </Text>
                <View className="space-y-3">
                  <Button
                    title="Manage Stores"
                    onPress={() => router.push('/owner/stores')}
                    variant="outline"
                  />
                  <Button
                    title="View Bookings"
                    onPress={() => router.push('/owner/bookings')}
                    variant="outline"
                  />
                  <Button
                    title="Add New Store"
                    onPress={() => router.push('/owner/add-store')}
                    variant="primary"
                  />
                </View>
              </Card>

              {/* Recent Bookings */}
              <Card>
                <Text style={{ color: textColor }} className="text-xl font-bold mb-4">
                  Recent Bookings
                </Text>
                {recentBookings.length === 0 ? (
                  <Text style={{ color: textColor }} className="text-center opacity-70 py-4">
                    No recent bookings
                  </Text>
                ) : (
                  <View className="space-y-3">
                    {recentBookings.slice(0, 5).map((booking: any) => (
                      <View key={booking.id} className="border-b border-gray-200 pb-3">
                        <View className="flex-row justify-between items-start">
                          <View className="flex-1">
                            <Text style={{ color: textColor }} className="font-semibold">
                              {booking.customer.user.name}
                            </Text>
                            <Text style={{ color: textColor }} className="text-sm opacity-70">
                              {booking.storeService.serviceType.name} • {booking.store.name}
                            </Text>
                            <Text style={{ color: textColor }} className="text-sm opacity-70">
                              {new Date(booking.bookingDate).toLocaleDateString()} at {booking.startTime}
                            </Text>
                          </View>
                          <View className={`px-2 py-1 rounded ${
                            booking.status === 'CONFIRMED' ? 'bg-green-100' :
                            booking.status === 'PENDING' ? 'bg-yellow-100' :
                            booking.status === 'COMPLETED' ? 'bg-blue-100' :
                            'bg-red-100'
                          }`}>
                            <Text className={`text-xs font-semibold ${
                              booking.status === 'CONFIRMED' ? 'text-green-800' :
                              booking.status === 'PENDING' ? 'text-yellow-800' :
                              booking.status === 'COMPLETED' ? 'text-blue-800' :
                              'text-red-800'
                            }`}>
                              {booking.status}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
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