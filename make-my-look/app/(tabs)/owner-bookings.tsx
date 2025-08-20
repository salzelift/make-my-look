import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { storesAPI, bookingsAPI } from '@/services/api';
import { Store, Booking } from '@/types';

export default function OwnerBookingsScreen() {
  const { user, isAuthenticated } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

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

    loadStores();
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (selectedStore) {
      loadBookings();
    }
  }, [selectedStore, filter]);

  const loadStores = async () => {
    try {
      setLoading(true);
      const response = await storesAPI.getMyStores();
      setStores(response.stores);
      if (response.stores.length > 0) {
        setSelectedStore(response.stores[0].id);
      }
    } catch (error) {
      console.error('Failed to load stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    if (!selectedStore) return;
    
    try {
      setLoading(true);
      const filters: any = {};
      if (filter !== 'all') {
        filters.status = filter.toUpperCase();
      }
      
      const response = await bookingsAPI.getStoreBookings(selectedStore, filters);
      setBookings(response.bookings);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      await bookingsAPI.updateBookingStatus(bookingId, status);
      loadBookings(); // Refresh bookings
    } catch (error) {
      console.error('Failed to update booking:', error);
    }
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

  if (!isAuthenticated || user?.userType !== 'OWNER') {
    return null; // Will redirect
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-8">
          {/* Header */}
          <View className="mb-8">
            <Text style={{ color: textColor }} className="text-3xl font-bold mb-2">
              Bookings
            </Text>
            <Text style={{ color: textColor }} className="text-base opacity-70">
              Manage your appointments
            </Text>
          </View>

          {/* Store Selector */}
          {stores.length > 1 && (
            <Card style={{ marginBottom: 24 }}>
              <Text style={{ color: textColor }} className="text-lg font-bold mb-3">
                Select Store
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row space-x-3">
                  {stores.map((store) => (
                    <TouchableOpacity
                      key={store.id}
                      onPress={() => setSelectedStore(store.id)}
                      className={`rounded-full px-6 py-3 border ${
                        selectedStore === store.id 
                          ? 'bg-black border-black' 
                          : 'border-gray-300'
                      }`}
                    >
                      <Text className={`font-semibold ${
                        selectedStore === store.id ? 'text-white' : 'text-black'
                      }`}>
                        {store.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </Card>
          )}

          {/* Filter Tabs */}
          <Card style={{ marginBottom: 24 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row space-x-3">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'pending', label: 'Pending' },
                  { key: 'confirmed', label: 'Confirmed' },
                  { key: 'completed', label: 'Completed' },
                ].map((filterOption) => (
                  <TouchableOpacity
                    key={filterOption.key}
                    onPress={() => setFilter(filterOption.key)}
                    className={`rounded-full px-4 py-2 border ${
                      filter === filterOption.key 
                        ? 'bg-black border-black' 
                        : 'border-gray-300'
                    }`}
                  >
                    <Text className={`text-sm font-semibold ${
                      filter === filterOption.key ? 'text-white' : 'text-black'
                    }`}>
                      {filterOption.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </Card>

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
                  No Bookings Found
                </Text>
                <Text style={{ color: textColor }} className="text-base opacity-70 text-center">
                  {filter === 'all' 
                    ? 'No bookings for this store yet'
                    : `No ${filter} bookings found`
                  }
                </Text>
              </View>
            </Card>
          ) : (
            <View className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                      <Text style={{ color: textColor }} className="text-lg font-bold mb-1">
                        {booking.customer?.user.name}
                      </Text>
                      <Text style={{ color: textColor }} className="text-base mb-1">
                        {booking.storeService.serviceType.name}
                      </Text>
                      <Text style={{ color: textColor }} className="text-sm opacity-70">
                        📞 {booking.customer?.user.phoneNumber}
                      </Text>
                    </View>
                    
                    <View className="ml-4">
                      <Text style={{ color: textColor }} className="text-2xl">
                        👤
                      </Text>
                    </View>
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

                    <View className="flex-row justify-between items-center mb-3">
                      <Text style={{ color: textColor }} className="text-sm opacity-70">
                        Payment
                      </Text>
                      <Text style={{ color: textColor }} className="text-sm font-semibold">
                        ${booking.paidAmount.toFixed(2)} / ${booking.totalPrice.toFixed(2)}
                      </Text>
                    </View>

                    <View className="flex-row justify-between items-center mb-3">
                      <View className={`px-2 py-1 rounded ${getStatusColor(booking.status)}`}>
                        <Text className={`text-xs font-semibold ${getStatusColor(booking.status).split(' ')[1]}`}>
                          {booking.status}
                        </Text>
                      </View>

                      <View className={`px-2 py-1 rounded ${
                        booking.paymentStatus === 'FULL' ? 'bg-green-100' :
                        booking.paymentStatus === 'PARTIAL' ? 'bg-orange-100' :
                        'bg-red-100'
                      }`}>
                        <Text className={`text-xs font-semibold ${
                          booking.paymentStatus === 'FULL' ? 'text-green-800' :
                          booking.paymentStatus === 'PARTIAL' ? 'text-orange-800' :
                          'text-red-800'
                        }`}>
                          {booking.paymentStatus === 'PARTIAL' ? '50% PAID' : booking.paymentStatus}
                        </Text>
                      </View>
                    </View>

                    {booking.status === 'PENDING' && (
                      <View className="flex-row space-x-2">
                        <Button
                          title="Confirm"
                          onPress={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                          variant="primary"
                          size="small"
                          style={{ flex: 1 }}
                        />
                        <Button
                          title="Cancel"
                          onPress={() => updateBookingStatus(booking.id, 'CANCELLED')}
                          variant="outline"
                          size="small"
                          style={{ flex: 1 }}
                        />
                      </View>
                    )}

                    {booking.status === 'CONFIRMED' && (
                      <Button
                        title="Mark as Completed"
                        onPress={() => updateBookingStatus(booking.id, 'COMPLETED')}
                        variant="primary"
                        size="small"
                      />
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