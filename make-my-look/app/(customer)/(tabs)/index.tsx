import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { customersAPI, storesAPI } from '@/services/api';
import { Store, ServiceType } from '@/types';
import { Search, MapPin, Star, Clock, Sparkles, Scissors, Heart, Zap } from 'lucide-react-native';

export default function CustomerHomeScreen() {
  const { user, isAuthenticated } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

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

    loadStores();
  }, [isAuthenticated, user]);

  const loadStores = async () => {
    try {
      setLoading(true);
      const response = await storesAPI.getAllStores();
      setStores(response.stores);
    } catch (error) {
      console.error('Failed to load stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await customersAPI.searchStores({ query: searchQuery });
      setStores(response.stores);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const popularServices = [
    { name: 'Haircut', icon: '💇‍♀️', color: '#667eea' },
    { name: 'Facial', icon: '✨', color: '#f093fb' },
    { name: 'Manicure', icon: '💅', color: '#f5576c' },
    { name: 'Massage', icon: '💆‍♀️', color: '#4facfe' },
    { name: 'Styling', icon: '🎨', color: '#43e97b' },
  ];

  if (!isAuthenticated) {
    return null; // Will redirect to auth
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-8">
          {/* Header */}
          <View className="mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text style={{ color: textColor }} className="text-3xl font-bold mb-1">
                  Find Your Salon
                </Text>
                <Text style={{ color: textColor }} className="text-base opacity-70">
                  Discover and book premium beauty services
                </Text>
              </View>
              <TouchableOpacity className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center">
                <Heart size={20} color={textColor} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search */}
          <Card variant="elevated" style={{ marginBottom: 24 }}>
            <View className="flex-row items-center">
              <View className="flex-1 mr-3">
                <View className="relative">
                  <TextInput
                    className="border-0 rounded-lg px-4 py-4 text-base pl-12"
                    style={{ 
                      backgroundColor: 'transparent',
                      color: textColor,
                    }}
                    placeholder="Search salons or services..."
                    placeholderTextColor={placeholderColor}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                  />
                  <View className="absolute left-4 top-4">
                    <Search size={20} color={placeholderColor} />
                  </View>
                </View>
              </View>
              <Button
                title="Search"
                onPress={handleSearch}
                loading={loading}
                variant="primary"
                size="medium"
                icon="🔍"
              />
            </View>
          </Card>

          {/* Popular Services */}
          <View className="mb-8">
            <Text style={{ color: textColor }} className="text-xl font-bold mb-4">
              Popular Services
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-2">
              <View className="flex-row space-x-3">
                {popularServices.map((service) => (
                  <TouchableOpacity
                    key={service.name}
                    className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl px-6 py-4 border border-primary-200"
                    onPress={() => {
                      setSearchQuery(service.name);
                      handleSearch();
                    }}
                  >
                    <View className="items-center">
                      <Text className="text-2xl mb-2">{service.icon}</Text>
                      <Text style={{ color: textColor }} className="font-semibold text-sm">
                        {service.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Stores List */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text style={{ color: textColor }} className="text-xl font-bold">
                {searchQuery ? 'Search Results' : 'Nearby Salons'}
              </Text>
              <TouchableOpacity>
                <Text style={{ color: textColor }} className="text-sm font-medium text-primary-600">
                  View All
                </Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <Loading text="Finding the best salons for you..." />
            ) : filteredStores.length === 0 ? (
              <Card variant="outlined" style={{ padding: 40 }}>
                <View className="items-center">
                  <Search size={48} color={placeholderColor} />
                  <Text style={{ color: textColor }} className="text-lg font-semibold mt-4 mb-2">
                    No salons found
                  </Text>
                  <Text style={{ color: textColor }} className="text-base opacity-70 text-center">
                    Try adjusting your search terms or browse our popular services
                  </Text>
                </View>
              </Card>
            ) : (
              <View className="space-y-4">
                {filteredStores.map((store) => (
                  <TouchableOpacity
                    key={store.id}
                    onPress={() => router.push(`/store/${store.id}`)}
                  >
                    <Card variant="elevated">
                      <View className="flex-row justify-between items-start">
                        <View className="flex-1">
                          <View className="flex-row items-center mb-2">
                            <Text style={{ color: textColor }} className="text-lg font-bold mr-2">
                              {store.name}
                            </Text>
                            <View className="flex-row items-center bg-success-100 px-2 py-1 rounded-full">
                              <Star size={12} color="#22C55E" />
                              <Text className="text-success-700 text-xs font-medium ml-1">4.8</Text>
                            </View>
                          </View>
                          
                          <View className="flex-row items-center mb-3">
                            <MapPin size={14} color={placeholderColor} />
                            <Text style={{ color: textColor }} className="text-sm opacity-70 ml-1">
                              {store.address}
                            </Text>
                          </View>
                          
                          {store.services.length > 0 && (
                            <View className="flex-row flex-wrap mb-3">
                              {store.services.slice(0, 3).map((service) => (
                                <View
                                  key={service.id}
                                  className="bg-primary-100 rounded-full px-3 py-1 mr-2 mb-1"
                                >
                                  <Text className="text-xs font-medium text-primary-700">
                                    {service.serviceType.name}
                                  </Text>
                                </View>
                              ))}
                              {store.services.length > 3 && (
                                <View className="bg-gray-100 rounded-full px-3 py-1">
                                  <Text className="text-xs font-medium text-gray-600">
                                    +{store.services.length - 3} more
                                  </Text>
                                </View>
                              )}
                            </View>
                          )}
                          
                          <View className="flex-row items-center">
                            <Clock size={14} color={placeholderColor} />
                            <Text style={{ color: textColor }} className="text-sm opacity-70 ml-1">
                              Open until 8:00 PM
                            </Text>
                          </View>
                        </View>
                        
                        <View className="ml-4">
                          <View className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 items-center justify-center">
                            <Scissors size={24} color="#FFFFFF" />
                          </View>
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
