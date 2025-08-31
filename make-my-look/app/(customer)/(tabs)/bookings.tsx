import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Card } from '@/components/ui/Card';
import RemainingPaymentButton from '@/components/remaining-payment-button';
import { bookingsAPI } from '@/services/api';
import { Booking } from '@/types';

export default function BookingsScreen() {
  const { user, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/welcome');
      return;
    }

    if (user?.userType === 'OWNER') {
      router.replace('/(owner)/(tabs)/dashboard');
      return;
    }

    loadBookings();
  }, [isAuthenticated, user]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsAPI.getMyBookings();
      setBookings(response.bookings);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    // Refresh bookings after successful payment
    loadBookings();
    Alert.alert(
      'Payment Successful!',
      'Your remaining payment has been processed successfully. Your booking is now fully paid.',
      [{ text: 'OK' }]
    );
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment failed:', error);
    Alert.alert('Payment Failed', error);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'FULL': return 'bg-green-100 text-green-800';
      case 'PARTIAL': return 'bg-orange-100 text-orange-800';
      case 'PENDING': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated || user?.userType !== 'CUSTOMER') {
    return null; // Will redirect
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-8">
          {/* Header */}
          <View className="mb-8">
            <Text style={{ color: textColor }} className="text-3xl font-bold mb-2">
              My Bookings
            </Text>
            <Text style={{ color: textColor }} className="text-base opacity-70">
              Track your appointments
            </Text>
          </View>

          {/* Bookings List */}
          {loading ? (
            <View className="py-8">
              <Text style={{ color: textColor }} className="text-center opacity-70">
                Loading bookings...
              </Text>
            </View>
          ) : bookings.length === 0 ? (
            <Card>
              <View className="items-center py-8">
                <Text style={{ color: textColor }} className="text-6xl mb-4">📅</Text>
                <Text style={{ color: textColor }} className="text-xl font-bold mb-2">
                  No Bookings Yet
                </Text>
                <Text style={{ color: textColor }} className="text-base opacity-70 text-center mb-6">
                  Start booking your favorite beauty services
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/(customer)/(tabs)')}
                  className="bg-black rounded-lg px-6 py-3"
                >
                  <Text className="text-white font-semibold">Find Salons</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ) : (
            <View className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                      <Text style={{ color: textColor }} className="text-lg font-bold mb-1">
                        {booking.store.name}
                      </Text>
                      <Text style={{ color: textColor }} className="text-base mb-1">
                        {booking.storeService.serviceType.name}
                      </Text>
                      <Text style={{ color: textColor }} className="text-sm opacity-70">
                        {booking.store.address}
                      </Text>
                    </View>
                    <Text style={{ color: textColor }} className="text-2xl">
                      💇‍♀️
                    </Text>
                  </View>

                  <View className="border-t border-gray-200 pt-3">
                    <View className="flex-row justify-between items-center mb-2">
                      <Text style={{ color: textColor }} className="text-sm opacity-70">
                        Date & Time
                      </Text>
                      <Text style={{ color: textColor }} className="text-sm font-semibold">
                        {new Date(booking.bookingDate).toLocaleDateString()} • {booking.startTime}
                      </Text>
                    </View>

                    <View className="flex-row justify-between items-center mb-2">
                      <Text style={{ color: textColor }} className="text-sm opacity-70">
                        Duration
                      </Text>
                      <Text style={{ color: textColor }} className="text-sm font-semibold">
                        {booking.storeService.duration} minutes
                      </Text>
                    </View>

                    <View className="flex-row justify-between items-center mb-2">
                      <Text style={{ color: textColor }} className="text-sm opacity-70">
                        Total Price
                      </Text>
                      <Text style={{ color: textColor }} className="text-sm font-semibold">
                        ${booking.totalPrice.toFixed(2)}
                      </Text>
                    </View>

                    {booking.paymentStatus === 'PARTIAL' && (
                      <View className="flex-row justify-between items-center mb-2">
                        <Text style={{ color: textColor }} className="text-sm opacity-70">
                          Paid Amount
                        </Text>
                        <Text style={{ color: textColor }} className="text-sm font-semibold">
                          ${booking.paidAmount.toFixed(2)}
                        </Text>
                      </View>
                    )}

                    {booking.paymentStatus === 'PARTIAL' && (
                      <View className="flex-row justify-between items-center mb-3">
                        <Text style={{ color: textColor }} className="text-sm opacity-70">
                          Remaining
                        </Text>
                        <Text style={{ color: textColor }} className="text-sm font-semibold text-orange-600">
                          ${(booking.totalPrice - booking.paidAmount).toFixed(2)}
                        </Text>
                      </View>
                    )}

                    <View className="flex-row justify-between items-center mb-3">
                      <View className={`px-2 py-1 rounded ${getStatusColor(booking.status)}`}>
                        <Text className={`text-xs font-semibold ${getStatusColor(booking.status).split(' ')[1]}`}>
                          {booking.status}
                        </Text>
                      </View>

                      <View className={`px-2 py-1 rounded ${getPaymentStatusColor(booking.paymentStatus)}`}>
                        <Text className={`text-xs font-semibold ${getPaymentStatusColor(booking.paymentStatus).split(' ')[1]}`}>
                          {booking.paymentStatus === 'PARTIAL' ? '50% PAID' : booking.paymentStatus}
                        </Text>
                      </View>
                    </View>

                    {/* Pay Now Button for Partial Payments */}
                    {booking.paymentStatus === 'PARTIAL' && booking.status !== 'CANCELLED' && (
                      <View className="mt-3 pt-3 border-t border-gray-200">
                        <RemainingPaymentButton
                          booking={booking}
                          onPaymentSuccess={handlePaymentSuccess}
                          onPaymentError={handlePaymentError}
                        />
                      </View>
                    )}

                    {booking.notes && (
                      <View className="mt-3 pt-3 border-t border-gray-200">
                        <Text style={{ color: textColor }} className="text-sm opacity-70">
                          Notes: {booking.notes}
                        </Text>
                      </View>
                    )}
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}