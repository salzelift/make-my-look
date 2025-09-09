import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { customersAPI, servicesAPI } from '@/services/api';
import { Store, ServiceType } from '@/types';
import { Key } from 'lucide-react-native';

export default function SearchScreen() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [stores, setStores] = useState<Store[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [customerProfile, setCustomerProfile] = useState<any>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'placeholder');

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/welcome');
      return;
    }

    if (user?.userType === 'OWNER') {
      router.replace('/(owner)/(tabs)/dashboard');
      return;
    }

    loadCustomerProfile();
  }, [isAuthenticated, user]);

  const loadCustomerProfile = async () => {
    try {
      const response = await customersAPI.getProfile();
      setCustomerProfile(response.customer);
      await loadServiceTypes();
    } catch (error) {
      console.error('Failed to load customer profile:', error);
    }
  };

  const loadServiceTypes = async () => {
    try {
      const response = await servicesAPI.getServiceTypes();
      setServiceTypes(response.services);
    } catch (error) {
      console.error('Failed to load service types:', error);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      
      if (searchQuery.trim()) {
        filters.query = searchQuery.trim();
      }
      
      if (selectedCategory) {
        const categoryServices = serviceTypes.filter(s => s.category === selectedCategory);
        if (categoryServices.length > 0) {
          filters.serviceType = categoryServices[0].id; // Use first service of category for now
        }
      }

      const response = await customersAPI.searchStores(filters);
      setStores(response.stores);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(serviceTypes.map(s => s.category))];

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
              Search Salons
            </Text>
            <Text style={{ color: textColor }} className="text-base opacity-70">
              Find the perfect salon for your needs
            </Text>
          </View>

          {/* Search Input */}
          <View className="mb-6">
            <View className="flex-row">
              <View className="flex-1 mr-3">
                <TextInput
                  className="border rounded-lg px-4 py-3 text-base"
                  style={{ 
                    backgroundColor: useThemeColor({}, 'inputBackground'),
                    color: textColor,
                    borderColor: useThemeColor({}, 'border')
                  }}
                  placeholder="Search by salon name or location..."
                  placeholderTextColor={placeholderColor}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearch}
                />
              </View>
              <Button
                title="Search"
                onPress={handleSearch}
                loading={loading}
                style={{ paddingHorizontal: 20 }}
              />
            </View>
          </View>

          {/* Categories */}
          <View className="mb-6">
            <Text style={{ color: textColor }} className="text-xl font-bold mb-4">
              Browse by Category
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCategory('');
                    handleSearch();
                  }}
                  className={`rounded-full px-6 py-3 border ${
                    selectedCategory === '' 
                      ? 'bg-black border-black' 
                      : 'border-gray-300'
                  }`}
                >
                  <Text className={`font-semibold ${
                    selectedCategory === '' ? 'text-white' : 'text-black'
                  }`}>
                    All
                  </Text>
                </TouchableOpacity>
                
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => {
                      setSelectedCategory(category);
                      handleSearch();
                    }}
                    className={`rounded-full px-6 py-3 border ${
                      selectedCategory === category 
                        ? 'bg-black border-black' 
                        : 'border-gray-300'
                    }`}
                  >
                    <Text className={`font-semibold ${
                      selectedCategory === category ? 'text-white' : 'text-black'
                    }`}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Search Results */}
          <View className="mb-6">
            <Text style={{ color: textColor }} className="text-xl font-bold mb-4">
              {stores.length > 0 ? 'Search Results' : 'Popular Salons'}
            </Text>

            {loading ? (
              <View className="py-8">
                <Text style={{ color: textColor }} className="text-center opacity-70">
                  Searching...
                </Text>
              </View>
            ) : stores.length === 0 ? (
              <Card>
                <View className="items-center py-8">
                  <Text style={{ color: textColor }} className="text-4xl mb-4">🔍</Text>
                  <Text style={{ color: textColor }} className="text-lg font-bold mb-2">
                    No Results Found
                  </Text>
                  <Text style={{ color: textColor }} className="text-base opacity-70 text-center">
                    Try adjusting your search terms or browse by category
                  </Text>
                </View>
              </Card>
            ) : (
              <View className="space-y-4">
                {stores.map((store) => (
                  <TouchableOpacity
                    key={store.id}
                    onPress={() => router.push(`/store/${store.id}`)}
                  >
                    <Card>
                      <View className="flex-row justify-between items-start">
                        <View className="flex-1">
                          <Text style={{ color: textColor }} className="text-lg font-bold mb-1">
                            {store.name}
                          </Text>
                          <Text style={{ color: textColor }} className="text-sm opacity-70 mb-2">
                            {store.address}
                          </Text>
                          
                          {store.owner && (
                            <Text style={{ color: textColor }} className="text-sm opacity-70 mb-2">
                              Owner: {store.owner.user.name}
                            </Text>
                          )}
                          
                          {store.services.length > 0 && (
                            <View className="flex-row flex-wrap">
                              {store.services.slice(0, 4).map((service) => (
                                <View
                                  key={service.id}
                                  className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-1"
                                >
                                  <Text className="text-xs text-black font-medium">
                                    {service.serviceType.name} • ${service.price}
                                  </Text>
                                </View>
                              ))}
                              {store.services.length > 4 && (
                                <View className="bg-gray-100 rounded-full px-3 py-1">
                                  <Text className="text-xs text-black font-medium">
                                    +{store.services.length - 4} more
                                  </Text>
                                </View>
                              )}
                            </View>
                          )}

                          {store.distance && (
                            <Text style={{ color: textColor }} className="text-sm opacity-70 mt-2">
                              📍 {store.distance.toFixed(1)} km away
                            </Text>
                          )}
                        </View>
                        
                        <View className="ml-4">
                          <Text style={{ color: textColor }} className="text-2xl">
                            💇‍♀️
                          </Text>
                        </View>
                      </View>
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}