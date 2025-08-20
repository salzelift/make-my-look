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

export default function RegisterCustomerScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [preferredServices, setPreferredServices] = useState<string[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { registerCustomer } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    loadServiceTypes();
  }, []);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await registerCustomer({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        password: formData.password,
        preferredServices,
      });
      // Navigation will be handled by the auth context
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (serviceId: string) => {
    setPreferredServices(prev => 
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
                Create Account
              </Text>
              <Text style={{ color: textColor }} className="text-base opacity-70 text-center">
                Join as a customer
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

            {/* Preferred Services */}
            <Card style={{ marginBottom: 24 }}>
              <Text style={{ color: textColor }} className="text-xl font-bold mb-2">
                Preferred Services
              </Text>
              <Text style={{ color: textColor }} className="text-sm opacity-70 mb-4">
                Select services you're interested in (optional)
              </Text>

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
                          preferredServices.includes(service.id) 
                            ? 'bg-black border-black' 
                            : 'border-gray-300'
                        }`}
                      >
                        <Text 
                          className={`text-sm ${
                            preferredServices.includes(service.id) 
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
              title="Create Account"
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