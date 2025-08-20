import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { servicesAPI } from '@/services/api';
import { ServiceType } from '@/types';

export default function RegisterOwnerScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  
  const [storeData, setStoreData] = useState({
    storeName: '',
    storeEmail: '',
    storeAddress: '',
    storePhoneNumber: '',
    useSamePhone: true,
  });
  
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { registerOwner } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    loadServiceTypes();
  }, []);

  useEffect(() => {
    if (storeData.useSamePhone) {
      setStoreData(prev => ({ ...prev, storePhoneNumber: formData.phoneNumber }));
    }
  }, [formData.phoneNumber, storeData.useSamePhone]);

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

    // Personal info validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Store info validation
    if (!storeData.storeName.trim()) {
      newErrors.storeName = 'Store name is required';
    }

    if (!storeData.storeAddress.trim()) {
      newErrors.storeAddress = 'Store address is required';
    }

    if (!storeData.useSamePhone && !storeData.storePhoneNumber.trim()) {
      newErrors.storePhoneNumber = 'Store phone number is required';
    }

    if (selectedServices.length === 0) {
      newErrors.services = 'At least one service must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await registerOwner({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        password: formData.password,
        store: {
          storeName: storeData.storeName.trim(),
          storeEmail: storeData.storeEmail.trim() || undefined,
          storeAddress: storeData.storeAddress.trim(),
          storePhoneNumber: storeData.useSamePhone 
            ? formData.phoneNumber.trim() 
            : storeData.storePhoneNumber.trim(),
          serviceIds: selectedServices,
        },
      });
      // Navigation will be handled by the auth context
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
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

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="flex-1 px-6 pt-12">
            {/* Header */}
            <View className="items-center mb-8">
              <TouchableOpacity 
                onPress={() => router.back()}
                className="absolute left-0 top-0"
              >
                <Text style={{ color: textColor }} className="text-lg">← Back</Text>
              </TouchableOpacity>
              
              <Text style={{ color: textColor }} className="text-3xl font-bold mb-2">
                Salon Owner
              </Text>
              <Text style={{ color: textColor }} className="text-base opacity-70 text-center">
                Create your business account
              </Text>
            </View>

            {/* Personal Information */}
            <Card style={{ marginBottom: 24 }}>
              <Text style={{ color: textColor }} className="text-xl font-bold mb-4">
                Personal Information
              </Text>
              
              <View className="space-y-4">
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholder="Enter your full name"
                  error={errors.name}
                />

                <Input
                  label="Email"
                  value={formData.email}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                />

                <Input
                  label="Phone Number"
                  value={formData.phoneNumber}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, phoneNumber: text }))}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                  error={errors.phoneNumber}
                />

                <Input
                  label="Password"
                  value={formData.password}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                  placeholder="Create a password"
                  secureTextEntry
                  error={errors.password}
                />

                <Input
                  label="Confirm Password"
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                  placeholder="Confirm your password"
                  secureTextEntry
                  error={errors.confirmPassword}
                />
              </View>
            </Card>

            {/* Store Information */}
            <Card style={{ marginBottom: 24 }}>
              <Text style={{ color: textColor }} className="text-xl font-bold mb-4">
                Store Information
              </Text>
              
              <View className="space-y-4">
                <Input
                  label="Store Name"
                  value={storeData.storeName}
                  onChangeText={(text) => setStoreData(prev => ({ ...prev, storeName: text }))}
                  placeholder="Enter your salon name"
                  error={errors.storeName}
                />

                <Input
                  label="Store Email (Optional)"
                  value={storeData.storeEmail}
                  onChangeText={(text) => setStoreData(prev => ({ ...prev, storeEmail: text }))}
                  placeholder="Store email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Input
                  label="Store Address"
                  value={storeData.storeAddress}
                  onChangeText={(text) => setStoreData(prev => ({ ...prev, storeAddress: text }))}
                  placeholder="Enter full store address"
                  multiline
                  numberOfLines={2}
                  error={errors.storeAddress}
                />

                <View>
                  <TouchableOpacity
                    onPress={() => setStoreData(prev => ({ ...prev, useSamePhone: !prev.useSamePhone }))}
                    className="flex-row items-center mb-2"
                  >
                    <View className={`w-5 h-5 border-2 border-black rounded mr-3 ${storeData.useSamePhone ? 'bg-black' : ''}`}>
                      {storeData.useSamePhone && (
                        <Text className="text-white text-xs text-center">✓</Text>
                      )}
                    </View>
                    <Text style={{ color: textColor }} className="text-base">
                      Use same phone number for store
                    </Text>
                  </TouchableOpacity>

                  {!storeData.useSamePhone && (
                    <Input
                      label="Store Phone Number"
                      value={storeData.storePhoneNumber}
                      onChangeText={(text) => setStoreData(prev => ({ ...prev, storePhoneNumber: text }))}
                      placeholder="Enter store phone number"
                      keyboardType="phone-pad"
                      error={errors.storePhoneNumber}
                    />
                  )}
                </View>
              </View>
            </Card>

            {/* Services */}
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

            {/* Submit Button */}
            <Button
              title="Create Salon Account"
              onPress={handleRegister}
              loading={loading}
              size="large"
              style={{ marginBottom: 24 }}
            />

            {/* Footer */}
            <View className="items-center pb-6">
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={{ color: textColor }} className="text-base">
                  Already have an account?{' '}
                  <Text className="font-semibold underline">Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}