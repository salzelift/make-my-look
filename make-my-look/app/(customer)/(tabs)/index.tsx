import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, Alert, Modal } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Input } from '@/components/ui/Input';
import { customersAPI, storesAPI } from '@/services/api';
import { Store, ServiceType, Customer } from '@/types';
import { Search, MapPin, Star, Clock, Scissors, Heart, Key, X } from 'lucide-react-native';

export default function CustomerHomeScreen() {
  const { user, isAuthenticated } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerProfile, setCustomerProfile] = useState<Customer | null>(null);
  const [showOwnerCodeModal, setShowOwnerCodeModal] = useState(false);
  const [ownerCodeInput, setOwnerCodeInput] = useState('');
  const [ownerCodeError, setOwnerCodeError] = useState('');
  const [loadingStores, setLoadingStores] = useState(false);

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
      setLoading(true);
      const response = await customersAPI.getProfile();
      setCustomerProfile(response.customer);
      
      // Load stores only if customer has an associated owner
      if (response.customer.ownerId) {
        loadStores();
      }
    } catch (error) {
      console.error('Failed to load customer profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStores = async () => {
    try {
      setLoadingStores(true);
      const response = await customersAPI.searchStores({});
      setStores(response.stores);
    } catch (error) {
      console.error('Failed to load stores:', error);
    } finally {
      setLoadingStores(false);
    }
  };


  const handleEnterOwnerCode = () => {
    console.log('handleEnterOwnerCode called');
    setShowOwnerCodeModal(true);
    setOwnerCodeInput('');
    setOwnerCodeError('');
  };

  const handleSubmitOwnerCode = async () => {
    console.log('Submit owner code:', ownerCodeInput);
    
    if (!ownerCodeInput || !/^[A-Za-z0-9]{6,10}$/.test(ownerCodeInput)) {
      setOwnerCodeError('Please enter a valid owner code (6-10 alphanumeric characters)');
      return;
    }

    try {
      console.log('Attempting to enter owner code:', ownerCodeInput);
      setLoading(true);
      const response = await customersAPI.enterOwnerCode(ownerCodeInput.toUpperCase(), customerProfile?.id || '');
      console.log('Owner code response:', response);
      
      setShowOwnerCodeModal(false);
      Alert.alert(
        'Success!',
        `You are now connected to ${response.owner.name}'s salon.`,
        [{ text: 'OK', onPress: loadCustomerProfile }]
      );
    } catch (error: any) {
      console.error('Error entering owner code:', error);
      
      // Extract user-friendly error message
      let errorMessage = 'Failed to connect to salon';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Handle specific error cases
      if (errorMessage.includes('Invalid owner code') || errorMessage.includes('404')) {
        errorMessage = 'The owner code you entered is invalid. Please check with your salon and try again.';
      } else if (errorMessage.includes('400')) {
        errorMessage = 'Invalid owner code. Please check the code and try again.';
      } else if (errorMessage.includes('500')) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      setOwnerCodeError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeOwnerCode = () => {
    Alert.prompt(
      'Change Owner Code',
      'Enter a new owner code to connect to a different salon:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Change', 
          onPress: async (ownerCode) => {
            if (!ownerCode || !/^[A-Za-z0-9]{6,10}$/.test(ownerCode)) {
              Alert.alert('Error', 'Please enter a valid owner code (6-10 alphanumeric characters)');
              return;
            }

            try {
              setLoading(true);
              const response = await customersAPI.changeOwnerCode(ownerCode.toUpperCase());
              Alert.alert(
                'Success!',
                `You are now connected to ${response.owner.name}'s salon.`,
                [{ text: 'OK', onPress: loadCustomerProfile }]
              );
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to change salon connection');
            } finally {
              setLoading(false);
            }
          }
        }
      ],
      'plain-text',
      '',
      'default'
    );
  };


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
              <View className="flex-1">
                <Text style={{ color: textColor }} className="text-3xl font-bold mb-1">
                  {customerProfile?.owner ? `${customerProfile.owner.user.name}'s Salon` : 'Find Your Salon'}
                </Text>
                <Text style={{ color: textColor }} className="text-base opacity-70">
                  {customerProfile?.owner 
                    ? `Connected to ${customerProfile.owner.ownerCode} • Discover and book services`
                    : 'Enter owner code to access salon services'
                  }
                </Text>
              </View>
              <View className="flex-row items-center space-x-2">
                {customerProfile?.owner && (
                  <TouchableOpacity 
                    className="w-10 h-10 rounded-full bg-warning-100 items-center justify-center"
                    onPress={handleChangeOwnerCode}
                  >
                    <Key size={16} color="#F59E0B" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center"
                  onPress={() => router.push('/(customer)/(tabs)/profile')}
                >
                  <Heart size={20} color={textColor} />
                </TouchableOpacity>
              </View>
            </View>
          </View>


          {/* Popular Services */}
          <View className="mb-8">
            <Text style={{ color: textColor }} className="text-xl font-bold mb-4">
              Popular Services
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-2">
              <View className="flex-row space-x-3">
                {popularServices.map((service) => (
                  <View
                    key={service.name}
                    className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl px-6 py-4 border border-primary-200"
                  >
                    <View className="items-center">
                      <Text className="text-2xl mb-2">{service.icon}</Text>
                      <Text style={{ color: textColor }} className="font-semibold text-sm">
                        {service.name}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Stores List */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text style={{ color: textColor }} className="text-xl font-bold">
                Salon Services
              </Text>
              {customerProfile?.owner && (
                <TouchableOpacity onPress={handleChangeOwnerCode}>
                  <Text style={{ color: textColor }} className="text-sm font-medium text-primary-600">
                    Change Owner
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {loadingStores ? (
              <Loading text="Loading salon services..." />
            ) : !customerProfile?.ownerId ? (
              <Card variant="outlined" style={{ padding: 40 }}>
                <View className="items-center">
                  <Key size={48} color={placeholderColor} />
                  <Text style={{ color: textColor }} className="text-lg font-semibold mt-4 mb-2">
                    Connect to a Salon
                  </Text>
                  <Text style={{ color: textColor }} className="text-base opacity-70 text-center mb-6">
                    Enter the owner code provided by your salon to access their services and book appointments.
                  </Text>
                  <Button
                    title="Enter Owner Code"
                    onPress={() => {
                      console.log('Enter Owner Code button pressed');
                      handleEnterOwnerCode();
                    }}
                    variant="primary"
                    size="medium"
                    icon="🔑"
                  />
                </View>
              </Card>
            ) : stores.length === 0 ? (
              <Card variant="outlined" style={{ padding: 40 }}>
                <View className="items-center">
                  <Search size={48} color={placeholderColor} />
                  <Text style={{ color: textColor }} className="text-lg font-semibold mt-4 mb-2">
                    No services available
                  </Text>
                  <Text style={{ color: textColor }} className="text-base opacity-70 text-center">
                    This salon doesn't have any services available yet
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

      {/* Owner Code Modal */}
      <Modal
        visible={showOwnerCodeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOwnerCodeModal(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <Card style={{ width: '100%', maxWidth: 400 }}>
            <View className="flex-row items-center justify-between mb-6">
              <Text style={{ color: textColor }} className="text-xl font-bold">
                Enter Owner Code
              </Text>
              <TouchableOpacity
                onPress={() => setShowOwnerCodeModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <X size={16} color={textColor} />
              </TouchableOpacity>
            </View>
            
            <Text style={{ color: textColor }} className="text-base opacity-70 mb-6">
              Enter the owner code provided by your salon to access their services:
            </Text>
            
            <Input
              label="Owner Code"
              value={ownerCodeInput}
              onChangeText={(text) => {
                setOwnerCodeInput(text.toUpperCase());
                setOwnerCodeError('');
              }}
              placeholder="e.g., SALON123"
              autoCapitalize="characters"
              error={ownerCodeError}
              style={{ marginBottom: 20 }}
            />
            
            <View className="flex-row space-x-3">
              <Button
                title="Cancel"
                onPress={() => setShowOwnerCodeModal(false)}
                variant="outline"
                size="medium"
                style={{ flex: 1 }}
              />
              <Button
                title="Connect"
                onPress={handleSubmitOwnerCode}
                loading={loading}
                variant="primary"
                size="medium"
                style={{ flex: 1 }}
                icon="🔑"
              />
            </View>
          </Card>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
