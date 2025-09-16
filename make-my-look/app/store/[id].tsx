import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { storesAPI } from '@/services/api';
import { Store, StoreService } from '@/types';

export default function StoreDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/welcome');
      return;
    }

    if (id) {
      loadStoreDetails();
    }
  }, [id, isAuthenticated]);

  const loadStoreDetails = async () => {
    try {
      setLoading(true);
      const response = await storesAPI.getStoreById(id!);
      setStore(response.store);
    } catch (error) {
      console.error('Failed to load store details:', error);
      Alert.alert('Error', 'Failed to load store details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = (service: StoreService) => {
    if (user?.userType !== 'CUSTOMER') {
      Alert.alert('Access Denied', 'Only customers can book services');
      return;
    }

    router.push({
      pathname: '/booking/create',
      params: {
        storeId: store!.id,
        serviceId: service.id,
        storeName: store!.name,
        serviceName: service.serviceType.name,
        price: service.price.toString(),
        duration: service.duration.toString(),
      }
    });
  };

  const formatOperatingHours = () => {
    if (!store?.availability || store.availability.length === 0) {
      return 'Hours not set';
    }

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hours = store.availability
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
      .map(avail => `${days[avail.dayOfWeek]}: ${avail.startTime} - ${avail.endTime}`)
      .join('\n');

    return hours;
  };

  if (loading) {
    return <Loading message="Loading store details..." />;
  }

  if (!store) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor }}>
        <View className="flex-1 items-center justify-center px-6">
          <Text style={{ color: textColor }} className="text-xl font-bold mb-4">
            Store not found
          </Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <Stack.Screen options={
        {
          headerShown: false
        }
      }/>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-8">
          {/* Header */}
          <View className="flex justify-start gap-5 mb-6">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="mr-4"
            >
              <Text style={{ color: textColor }} className="text-lg">← Back</Text>
            </TouchableOpacity>
            <Text style={{ color: textColor }} className="text-2xl font-bold flex-1">
              {store.name}
            </Text>
          </View>

          {/* Store Info */}
          <Card style={{ marginBottom: 24 }}>
            <View className="items-center mb-6">
              <View className="w-20 h-20 rounded-full bg-black items-center justify-center mb-4">
                <Text className="text-white text-3xl">🏪</Text>
              </View>
              <Text style={{ color: textColor }} className="text-2xl font-bold mb-2">
                {store.name}
              </Text>
              <Text style={{ color: textColor }} className="text-base opacity-70 text-center">
                {store.address}
              </Text>
            </View>

            <View className="space-y-3">
              {store.phoneNumber && (
                <View className="flex-row items-center">
                  <Text style={{ color: textColor }} className="text-base mr-3">📞</Text>
                  <Text style={{ color: textColor }} className="text-base">
                    {store.phoneNumber}
                  </Text>
                </View>
              )}

              {store.email && (
                <View className="flex-row items-center">
                  <Text style={{ color: textColor }} className="text-base mr-3">✉️</Text>
                  <Text style={{ color: textColor }} className="text-base">
                    {store.email}
                  </Text>
                </View>
              )}

              {store.owner && (
                <View className="flex-row items-center">
                  <Text style={{ color: textColor }} className="text-base mr-3">👤</Text>
                  <Text style={{ color: textColor }} className="text-base">
                    Owner: {store.owner.user.name}
                  </Text>
                </View>
              )}
            </View>
          </Card>

          {/* Operating Hours */}
          {store.availability && store.availability.length > 0 && (
            <Card style={{ marginBottom: 24 }}>
              <Text style={{ color: textColor }} className="text-xl font-bold mb-4">
                Operating Hours
              </Text>
              <Text style={{ color: textColor, fontFamily: 'monospace' }} className="text-sm">
                {formatOperatingHours()}
              </Text>
            </Card>
          )}

          {/* Services */}
          <Card style={{ marginBottom: 24 }}>
            <Text style={{ color: textColor }} className="text-xl font-bold mb-4">
              Available Services
            </Text>

            {store.services.length === 0 ? (
              <Text style={{ color: textColor }} className="text-center opacity-70 py-4">
                No services available
              </Text>
            ) : (
              <View className="space-y-4">
                {store.services
                  .filter(service => service.isActive)
                  .map((service) => (
                    <View key={service.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1">
                          <Text style={{ color: textColor }} className="text-lg font-bold mb-1">
                            {service.serviceType.name}
                          </Text>
                          {service.description && (
                            <Text style={{ color: textColor }} className="text-sm opacity-70 mb-2">
                              {service.description}
                            </Text>
                          )}
                          <View className="flex-row items-center">
                            <Text style={{ color: textColor }} className="text-base font-semibold mr-4">
                              ${service.price.toFixed(2)}
                            </Text>
                            <Text style={{ color: textColor }} className="text-sm opacity-70">
                              {service.duration} minutes
                            </Text>
                          </View>
                        </View>
                        
                        <View className="ml-4">
                          <Text style={{ color: textColor }} className="text-2xl">
                            {service.serviceType.category === 'Hair' ? '💇‍♀️' :
                             service.serviceType.category === 'Nails' ? '💅' :
                             service.serviceType.category === 'Facial' ? '🧴' :
                             service.serviceType.category === 'Body' ? '💆‍♀️' :
                             '✨'}
                          </Text>
                        </View>
                      </View>

                      {user?.userType === 'CUSTOMER' && (
                        <Button
                          title="Book Now"
                          onPress={() => handleBookService(service)}
                          variant="primary"
                          size="small"
                        />
                      )}
                    </View>
                  ))}
              </View>
            )}
          </Card>

          {/* Contact Actions */}
          {user?.userType === 'CUSTOMER' && (
            <Card style={{ marginBottom: 24 }}>
              <Text style={{ color: textColor }} className="text-xl font-bold mb-4">
                Contact Store
              </Text>
              <View className="space-y-3">
                {store.phoneNumber && (
                  <Button
                    title={`Call ${store.phoneNumber}`}
                    onPress={() => {
                      // In a real app, you'd use Linking.openURL(`tel:${store.phoneNumber}`)
                      Alert.alert('Call Store', `Would call ${store.phoneNumber}`);
                    }}
                    variant="outline"
                  />
                )}
                
                <Button
                  title="Get Directions"
                  onPress={() => {
                    // In a real app, you'd open maps with the store address
                    Alert.alert('Directions', `Navigate to: ${store.address}`);
                  }}
                  variant="outline"
                />
              </View>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}