import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { storesAPI, servicesAPI } from '@/services/api';
import { ServiceType } from '@/types';

export default function AddStoreScreen() {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    phoneNumber: '',
    useSamePhone: true,
  });
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    if (!isAuthenticated || user?.userType !== 'OWNER') {
      router.replace('/(auth)/welcome');
      return;
    }

    loadServiceTypes();
    
    // Pre-fill phone number if using same
    if (formData.useSamePhone && user?.phoneNumber) {
      setFormData(prev => ({ ...prev, phoneNumber: user.phoneNumber }));
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (formData.useSamePhone && user?.phoneNumber) {
      setFormData(prev => ({ ...prev, phoneNumber: user.phoneNumber }));
    }
  }, [formData.useSamePhone, user?.phoneNumber]);

  const loadServiceTypes = async () => {
    try {
      const response = await servicesAPI.getServiceTypes();
      setServiceTypes(response.services);
    } catch (error) {
      console.error('Failed to load service types:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Store name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Store address is required';
    }

    if (!formData.useSamePhone && !formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }

    if (selectedServices.length === 0) {
      newErrors.services = 'At least one service must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await storesAPI.createStore({
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        address: formData.address.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        serviceIds: selectedServices,
      });

      Alert.alert(
        'Store Created!',
        'Your new store has been created successfully.',
        [
          {
            text: 'View Stores',
            onPress: () => router.push('/(owner)/(tabs)/stores')
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to create store');
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const groupedServices = serviceTypes.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, ServiceType[]>);

  if (!isAuthenticated || user?.userType !== 'OWNER') {
    return null;
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 pt-8">
            {/* Header */}
            <View className="flex-row items-center mb-8">
              <TouchableOpacity 
                onPress={() => router.back()}
                className="mr-4"
              >
                <Text style={{ color: textColor }} className="text-lg">← Back</Text>
              </TouchableOpacity>
              <Text style={{ color: textColor }} className="text-2xl font-bold flex-1">
                Add New Store
              </Text>
            </View>

            {/* Store Information */}
            <Card style={{ marginBottom: 24 }}>
              <Text style={{ color: textColor }} className="text-xl font-bold mb-4">
                Store Information
              </Text>
              
              <View className="space-y-4">
                <Input
                  label="Store Name"
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholder="Enter your salon name"
                  error={errors.name}
                />

                <Input
                  label="Store Email (Optional)"
                  value={formData.email}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                  placeholder="Store email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Input
                  label="Store Address"
                  value={formData.address}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                  placeholder="Enter full store address"
                  multiline
                  numberOfLines={2}
                  error={errors.address}
                />

                <View>
                  <TouchableOpacity
                    onPress={() => setFormData(prev => ({ ...prev, useSamePhone: !prev.useSamePhone }))}
                    className="flex-row items-center mb-2"
                  >
                    <View className={`w-5 h-5 border-2 border-black rounded mr-3 ${formData.useSamePhone ? 'bg-black' : ''}`}>
                      {formData.useSamePhone && (
                        <Text className="text-white text-xs text-center">✓</Text>
                      )}
                    </View>
                    <Text style={{ color: textColor }} className="text-base">
                      Use my phone number for store
                    </Text>
                  </TouchableOpacity>

                  {!formData.useSamePhone && (
                    <Input
                      label="Store Phone Number"
                      value={formData.phoneNumber}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, phoneNumber: text }))}
                      placeholder="Enter store phone number"
                      keyboardType="phone-pad"
                      error={errors.phoneNumber}
                    />
                  )}
                </View>
              </View>
            </Card>

            {/* Services Selection */}
            <Card style={{ marginBottom: 24 }}>
              <Text style={{ color: textColor }} className="text-xl font-bold mb-2">
                Services Offered
              </Text>
              <Text style={{ color: textColor }} className="text-sm opacity-70 mb-4">
                Select the services your salon provides
              </Text>
              {errors.services && (
                <Text className="text-red-500 text-sm mb-2">{errors.services}</Text>
              )}

              {Object.entries(groupedServices).map(([category, services]) => (
                <View key={category} className="mb-4">
                  <Text style={{ color: textColor }} className="text-lg font-semibold mb-2">
                    {category}
                  </Text>
                  <View className="flex-row flex-wrap">
                    {services.map((service) => (
                      <TouchableOpacity
                        key={service.id}
                        onPress={() => toggleService(service.id)}
                        className={`mr-2 mb-2 px-3 py-2 rounded-full border ${
                          selectedServices.includes(service.id) 
                            ? 'bg-black border-black' 
                            : 'border-gray-300'
                        }`}
                      >
                        <Text 
                          className={`text-sm ${
                            selectedServices.includes(service.id) 
                              ? 'text-white' 
                              : 'text-black'
                          }`}
                        >
                          {service.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </Card>

            {/* Note */}
            <Card style={{ marginBottom: 24 }}>
              <Text style={{ color: textColor }} className="text-base opacity-70">
                💡 After creating your store, you can set specific pricing and operating hours for each service.
              </Text>
            </Card>

            {/* Submit Button */}
            <Button
              title="Create Store"
              onPress={handleSubmit}
              loading={loading}
              size="large"
              style={{ marginBottom: 24 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}