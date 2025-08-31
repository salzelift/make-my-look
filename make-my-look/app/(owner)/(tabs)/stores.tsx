import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { storesAPI } from '@/services/api';
import { Store } from '@/types';

export default function OwnerStoresScreen() {
  const { user, isAuthenticated } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/welcome');
      return;
    }

    if (user?.userType !== 'OWNER') {
      router.replace('/(customer)/(tabs)/bookings');
      return;
    }

    loadStores();
  }, [isAuthenticated, user]);

  const loadStores = async () => {
    try {
      setLoading(true);
      const response = await storesAPI.getMyStores();
      setStores(response.stores);
    } catch (error) {
      console.error('Failed to load stores:', error);
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
          <View className="flex-row justify-between items-center mb-8 mt-10">
            <View>
              <Text style={{ color: textColor }} className="text-3xl font-bold mb-1">
                My Stores
              </Text>
              <Text style={{ color: textColor }} className="text-base opacity-70">
                Manage your salon locations
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(owner)/(tabs)/stores')}
              className="bg-black rounded-lg px-4 py-2"
            >
              <Text className="text-white font-semibold">+ Add Store</Text>
            </TouchableOpacity>
          </View>

          {/* Stores List */}
          {loading ? (
            <View className="py-8">
              <Text style={{ color: textColor }} className="text-center opacity-70">
                Loading stores...
              </Text>
            </View>
          ) : stores.length === 0 ? (
            <Card>
              <View className="items-center py-8">
                <Text style={{ color: textColor }} className="text-6xl mb-4">🏪</Text>
                <Text style={{ color: textColor }} className="text-xl font-bold mb-2">
                  No Stores Yet
                </Text>
                <Text style={{ color: textColor }} className="text-base opacity-70 text-center mb-6">
                  Add your first salon to start accepting bookings
                </Text>
                <Button
                  title="Add Your First Store"
                  onPress={() => router.push('/(owner)/(tabs)/stores')}
                  variant="primary"
                />
              </View>
            </Card>
          ) : (
            <View className="space-y-4 gap-4">
              {stores.map((store) => (
                <TouchableOpacity
                  key={store.id}
                  onPress={() => router.push(`/store/${store.id}`)}
                >
                  <Card>
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1">
                        <Text style={{ color: textColor }} className="text-lg font-bold mb-1">
                          {store.name}
                        </Text>
                        <Text style={{ color: textColor }} className="text-sm opacity-70 mb-2">
                          {store.address}
                        </Text>
                        
                        {store.phoneNumber && (
                          <Text style={{ color: textColor }} className="text-sm opacity-70 mb-2">
                            📞 {store.phoneNumber}
                          </Text>
                        )}
                      </View>
                      
                      <View className="ml-4">
                        <Text style={{ color: textColor }} className="text-2xl">
                          🏪
                        </Text>
                      </View>
                    </View>

                    <View className="border-t border-gray-200 pt-3">
                      <View className="flex-row justify-between items-center mb-2">
                        <Text style={{ color: textColor }} className="text-sm opacity-70">
                          Services
                        </Text>
                        <Text style={{ color: textColor }} className="text-sm font-semibold">
                          {store.services.length} active
                        </Text>
                      </View>

                      <View className="flex-row justify-between items-center mb-3">
                        <Text style={{ color: textColor }} className="text-sm opacity-70">
                          Total Bookings
                        </Text>
                        <Text style={{ color: textColor }} className="text-sm font-semibold">
                          {(store as any)._count?.bookings || 0}
                        </Text>
                      </View>

                      {store.services.length > 0 && (
                        <View className="flex-row flex-wrap">
                          {store.services.slice(0, 3).map((service) => (
                            <View
                              key={service.id}
                              className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-1"
                            >
                              <Text className="text-xs text-black font-medium">
                                {service.serviceType.name}
                              </Text>
                            </View>
                          ))}
                          {store.services.length > 3 && (
                            <View className="bg-gray-100 rounded-full px-3 py-1">
                              <Text className="text-xs text-black font-medium">
                                +{store.services.length - 3} more
                              </Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}