import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { storesAPI } from '@/services/api';
import { Store, StoreService } from '@/types';

export default function StoreManagementScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [serviceUpdates, setServiceUpdates] = useState<Record<string, any>>({});

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    if (!isAuthenticated || user?.userType !== 'OWNER') {
      router.replace('/(auth)/welcome');
      return;
    }

    if (id) {
      loadStoreDetails();
    }
  }, [id, isAuthenticated, user]);

  const loadStoreDetails = async () => {
    try {
      setLoading(true);
      const stores = await storesAPI.getMyStores();
      const foundStore = stores.stores.find(s => s.id === id);
      
      if (!foundStore) {
        Alert.alert('Error', 'Store not found or access denied');
        router.back();
        return;
      }
      
      setStore(foundStore);
    } catch (error) {
      console.error('Failed to load store details:', error);
      Alert.alert('Error', 'Failed to load store details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const updateService = async (serviceId: string) => {
    try {
      const updates = serviceUpdates[serviceId];
      if (!updates) return;

      await storesAPI.updateStoreService(store!.id, serviceId, updates);
      
      // Update local state
      setStore(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          services: prev.services.map(service => 
            service.id === serviceId 
              ? { ...service, ...updates }
              : service
          )
        };
      });

      setEditingService(null);
      setServiceUpdates(prev => {
        const newUpdates = { ...prev };
        delete newUpdates[serviceId];
        return newUpdates;
      });

      Alert.alert('Success', 'Service updated successfully');
    } catch (error) {
      console.error('Failed to update service:', error);
      Alert.alert('Error', 'Failed to update service');
    }
  };

  const setAvailability = () => {
    // Navigate to availability setting screen
    router.push(`/owner/store/${id}/availability`);
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
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-8">
          {/* Header */}
          <View className="flex-row items-center mb-6">
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

          {/* Store Information */}
          <Card style={{ marginBottom: 24 }}>
            <Text style={{ color: textColor }} className="text-xl font-bold mb-4">
              Store Information
            </Text>
            
            <View className="space-y-3">
              <View className="flex-row justify-between items-center">
                <Text style={{ color: textColor }} className="text-base opacity-70">
                  Address
                </Text>
                <Text style={{ color: textColor }} className="text-base font-medium flex-1 text-right">
                  {store.address}
                </Text>
              </View>
              
              {store.phoneNumber && (
                <View className="flex-row justify-between items-center">
                  <Text style={{ color: textColor }} className="text-base opacity-70">
                    Phone
                  </Text>
                  <Text style={{ color: textColor }} className="text-base font-medium">
                    {store.phoneNumber}
                  </Text>
                </View>
              )}
              
              {store.email && (
                <View className="flex-row justify-between items-center">
                  <Text style={{ color: textColor }} className="text-base opacity-70">
                    Email
                  </Text>
                  <Text style={{ color: textColor }} className="text-base font-medium">
                    {store.email}
                  </Text>
                </View>
              )}
            </View>

            <Button
              title="Set Operating Hours"
              onPress={setAvailability}
              variant="outline"
              style={{ marginTop: 16 }}
            />
          </Card>

          {/* Services Management */}
          <Card style={{ marginBottom: 24 }}>
            <Text style={{ color: textColor }} className="text-xl font-bold mb-4">
              Services & Pricing
            </Text>

            {store.services.length === 0 ? (
              <View className="py-8 items-center">
                <Text style={{ color: textColor }} className="text-base opacity-70 text-center mb-4">
                  No services configured yet
                </Text>
                <Button
                  title="Add Services"
                  onPress={() => router.push(`/owner/store/${id}/add-services`)}
                  variant="primary"
                />
              </View>
            ) : (
              <View className="space-y-4">
                {store.services.map((service) => (
                  <View key={service.id} className="border border-gray-200 rounded-lg p-4">
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1">
                        <Text style={{ color: textColor }} className="text-lg font-bold mb-1">
                          {service.serviceType.name}
                        </Text>
                        <Text style={{ color: textColor }} className="text-sm opacity-70">
                          {service.serviceType.category}
                        </Text>
                      </View>
                      
                      <TouchableOpacity
                        onPress={() => setEditingService(
                          editingService === service.id ? null : service.id
                        )}
                        className="ml-4"
                      >
                        <Text style={{ color: textColor }} className="text-base underline">
                          {editingService === service.id ? 'Cancel' : 'Edit'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {editingService === service.id ? (
                      <View className="space-y-3">
                        <Input
                          label="Price ($)"
                          value={serviceUpdates[service.id]?.price?.toString() || service.price.toString()}
                          onChangeText={(text) => setServiceUpdates(prev => ({
                            ...prev,
                            [service.id]: { ...prev[service.id], price: parseFloat(text) || 0 }
                          }))}
                          keyboardType="numeric"
                          placeholder="Enter price"
                        />
                        
                        <Input
                          label="Duration (minutes)"
                          value={serviceUpdates[service.id]?.duration?.toString() || service.duration.toString()}
                          onChangeText={(text) => setServiceUpdates(prev => ({
                            ...prev,
                            [service.id]: { ...prev[service.id], duration: parseInt(text) || 0 }
                          }))}
                          keyboardType="numeric"
                          placeholder="Enter duration"
                        />
                        
                        <Input
                          label="Description (Optional)"
                          value={serviceUpdates[service.id]?.description || service.description || ''}
                          onChangeText={(text) => setServiceUpdates(prev => ({
                            ...prev,
                            [service.id]: { ...prev[service.id], description: text }
                          }))}
                          placeholder="Service description"
                          multiline
                          numberOfLines={2}
                        />

                        <View className="flex-row space-x-2">
                          <Button
                            title="Save"
                            onPress={() => updateService(service.id)}
                            variant="primary"
                            size="small"
                            style={{ flex: 1 }}
                          />
                          <Button
                            title="Cancel"
                            onPress={() => {
                              setEditingService(null);
                              setServiceUpdates(prev => {
                                const newUpdates = { ...prev };
                                delete newUpdates[service.id];
                                return newUpdates;
                              });
                            }}
                            variant="outline"
                            size="small"
                            style={{ flex: 1 }}
                          />
                        </View>
                      </View>
                    ) : (
                      <View className="space-y-2">
                        <View className="flex-row justify-between">
                          <Text style={{ color: textColor }} className="text-base">Price:</Text>
                          <Text style={{ color: textColor }} className="text-base font-semibold">
                            ${service.price.toFixed(2)}
                          </Text>
                        </View>
                        
                        <View className="flex-row justify-between">
                          <Text style={{ color: textColor }} className="text-base">Duration:</Text>
                          <Text style={{ color: textColor }} className="text-base font-semibold">
                            {service.duration} minutes
                          </Text>
                        </View>
                        
                        {service.description && (
                          <View>
                            <Text style={{ color: textColor }} className="text-base mb-1">Description:</Text>
                            <Text style={{ color: textColor }} className="text-sm opacity-70">
                              {service.description}
                            </Text>
                          </View>
                        )}
                        
                        <View className="flex-row justify-between">
                          <Text style={{ color: textColor }} className="text-base">Status:</Text>
                          <View className={`px-2 py-1 rounded ${
                            service.isActive ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            <Text className={`text-xs font-semibold ${
                              service.isActive ? 'text-green-800' : 'text-red-800'
                            }`}>
                              {service.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}