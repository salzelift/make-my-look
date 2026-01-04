import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { router, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { customersAPI, servicesAPI } from '@/services/api';
import { ServiceType } from '@/types';
import { ArrowLeft, User, Phone, Mail, Save, Star, Heart } from 'lucide-react-native';

interface FormData {
  name: string;
  phoneNumber: string;
  preferredServices: string[];
}

interface FormErrors {
  name?: string;
  phoneNumber?: string;
}

export default function CustomerEditProfileScreen() {
  const { user, updateUser, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phoneNumber: '',
    preferredServices: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [, setServiceTypes] = useState<ServiceType[]>([]);
  const [groupedServices, setGroupedServices] = useState<Record<string, ServiceType[]>>({});

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/welcome');
      return;
    }

    if (user?.userType !== 'CUSTOMER') {
      router.replace('/(owner)/(tabs)/profile');
      return;
    }

    // Initialize form with current user data
    if (user) {
      setFormData({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
        preferredServices: [], // Will be loaded from customer profile
      });
    }

    loadServiceTypes();
    loadCustomerProfile();
  }, [isAuthenticated, user]);

  const loadServiceTypes = async () => {
    try {
      setServicesLoading(true);
      const response = await servicesAPI.getServiceTypes();
      setServiceTypes(response.services);
      setGroupedServices(response.groupedServices);
    } catch (error) {
      console.error('Failed to load service types:', error);
    } finally {
      setServicesLoading(false);
    }
  };

  const loadCustomerProfile = async () => {
    try {
      const response = await customersAPI.getProfile();
      if (response.customer) {
        setFormData(prev => ({
          ...prev,
          preferredServices: response.customer.preferredServices || [],
        }));
      }
    } catch (error) {
      console.error('Failed to load customer profile:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    // Phone number validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else {
      const cleanPhone = formData.phoneNumber.replace(/\s+/g, '').replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        newErrors.phoneNumber = 'Phone number must be at least 10 digits';
      } else if (cleanPhone.length > 15) {
        newErrors.phoneNumber = 'Phone number cannot exceed 15 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const togglePreferredService = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      preferredServices: prev.preferredServices.includes(serviceId)
        ? prev.preferredServices.filter(id => id !== serviceId)
        : [...prev.preferredServices, serviceId]
    }));
  };

  const handleSave = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      setLoading(true);

      // Check if anything actually changed
      const hasChanges = 
        formData.name !== user?.name || 
        formData.phoneNumber !== user?.phoneNumber ||
        formData.preferredServices.length > 0; // Always allow preferred services update

      if (!hasChanges) {
        Alert.alert('No Changes', 'No changes were made to your profile.');
        setLoading(false);
        return;
      }

      const updateData: { name?: string; phoneNumber?: string; preferredServices?: string[] } = {};
      
      if (formData.name !== user?.name) {
        updateData.name = formData.name.trim();
      }
      
      if (formData.phoneNumber !== user?.phoneNumber) {
        updateData.phoneNumber = formData.phoneNumber.replace(/\s+/g, '').replace(/\D/g, '');
      }

      // Always include preferred services (even if empty)
      updateData.preferredServices = formData.preferredServices;

      await customersAPI.updateProfile(updateData);

      // Update user context with new data (excluding preferredServices as it's not part of User type)
      if (user) {
        const updatedUser = {
          ...user,
          ...(updateData.name && { name: updateData.name }),
          ...(updateData.phoneNumber && { phoneNumber: updateData.phoneNumber }),
        };
        await updateUser(updatedUser);
      }

      Alert.alert(
        'Success',
        'Your profile has been updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      
      let errorMessage = 'Failed to update profile. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Check if there are unsaved changes
    const hasChanges = 
      formData.name !== user?.name || 
      formData.phoneNumber !== user?.phoneNumber ||
      formData.preferredServices.length > 0;

    if (hasChanges) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };

  if (!isAuthenticated || user?.userType !== 'CUSTOMER') {
    return null; // Will redirect
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <Stack.Screen options={
        {
          headerShown: false
        }
      }/>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-8">
            <TouchableOpacity
              onPress={handleCancel}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            >
              <ArrowLeft size={20} color={textColor} />
            </TouchableOpacity>
            
            <Text style={{ color: textColor }} className="text-xl font-bold">
              Edit Profile
            </Text>
            
            <View className="w-10 h-10" />
          </View>

          {/* Profile Avatar */}
          <View className="items-center mb-8">
            <View className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 items-center justify-center mb-4">
              <User size={40} color="#FFFFFF" />
            </View>
            <Text style={{ color: textColor }} className="text-lg font-medium opacity-70">
              Premium Customer
            </Text>
          </View>

          {/* Edit Form */}
          <Card style={{ marginBottom: 24 }}>
            <Text style={{ color: textColor }} className="text-xl font-bold mb-6">
              Profile Information
            </Text>
            
            <View className="space-y-4">
              {/* Name Input */}
              <Input
                label="Full Name"
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholder="Enter your full name"
                error={errors.name}
                leftIcon={<User size={20} color={textColor} />}
                variant="filled"
                autoCapitalize="words"
                maxLength={50}
              />

              {/* Phone Number Input */}
              <Input
                label="Phone Number"
                value={formData.phoneNumber}
                onChangeText={(value) => handleInputChange('phoneNumber', value)}
                placeholder="Enter your phone number"
                error={errors.phoneNumber}
                leftIcon={<Phone size={20} color={textColor} />}
                variant="filled"
                keyboardType="phone-pad"
                maxLength={15}
                helperText="Enter a valid phone number (10-15 digits)"
              />

              {/* Email (Read-only) */}
              <Input
                label="Email Address"
                value={user?.email || ''}
                placeholder="Email address"
                leftIcon={<Mail size={20} color={textColor} />}
                variant="filled"
                editable={false}
                style={{ opacity: 0.7 }}
                helperText="Email cannot be changed after registration"
              />
            </View>
          </Card>

          {/* Preferred Services */}
          <Card style={{ marginBottom: 24 }}>
            <View className="flex-row items-center justify-between mb-6">
              <Text style={{ color: textColor }} className="text-xl font-bold">
                Preferred Services
              </Text>
              <View className="flex-row items-center">
                <Heart size={16} color={textColor} />
                <Text style={{ color: textColor }} className="text-sm opacity-70 ml-1">
                  Optional
                </Text>
              </View>
            </View>

            {servicesLoading ? (
              <View className="py-8 items-center">
                <Text style={{ color: textColor }} className="text-base opacity-70">
                  Loading services...
                </Text>
              </View>
            ) : (
              <View className="space-y-4">
                {Object.entries(groupedServices).map(([category, services]) => (
                  <View key={category} className="mb-4">
                    <Text style={{ color: textColor }} className="text-lg font-semibold mb-3 capitalize">
                      {category}
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {services.map((service) => (
                        <TouchableOpacity
                          key={service.id}
                          onPress={() => togglePreferredService(service.id)}
                          className={`px-4 py-2 rounded-full border-2 ${
                            formData.preferredServices.includes(service.id)
                              ? 'bg-primary-100 border-primary-500'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <View className="flex-row items-center">
                            {formData.preferredServices.includes(service.id) && (
                              <Star size={14} color="#3B82F6" style={{ marginRight: 4 }} />
                            )}
                            <Text 
                              style={{ 
                                color: formData.preferredServices.includes(service.id) 
                                  ? '#3B82F6' 
                                  : textColor 
                              }} 
                              className="text-sm font-medium"
                            >
                              {service.name}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
                
                <View className="bg-blue-50 rounded-lg p-4 mt-4">
                  <View className="flex-row items-start">
                    <Text className="text-blue-600 text-sm mr-2">💡</Text>
                    <View className="flex-1">
                      <Text style={{ color: textColor }} className="text-sm font-medium mb-1">
                        Tip
                      </Text>
                      <Text style={{ color: textColor }} className="text-xs opacity-70 leading-4">
                        Select your preferred services to get personalized recommendations and faster booking options.
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </Card>

          {/* Action Buttons */}
          <View className="space-y-3 mb-8">
            <Button
              title={loading ? "Saving..." : "Save Changes"}
              onPress={handleSave}
              disabled={loading}
              icon={<Save size={20} color="white" />}
              style={{ marginBottom: 12 }}
            />
            
            <Button
              title="Cancel"
              onPress={handleCancel}
              variant="outline"
              disabled={loading}
            />
          </View>

          {/* Info Card */}
          <Card style={{ marginBottom: 24 }}>
            <View className="bg-green-50 rounded-lg p-4">
              <View className="flex-row items-start">
                <Text className="text-green-600 text-sm mr-2">ℹ️</Text>
                <View className="flex-1">
                  <Text style={{ color: textColor }} className="text-sm font-medium mb-1">
                    Profile Update
                  </Text>
                  <Text style={{ color: textColor }} className="text-xs opacity-70 leading-4">
                    Changes to your profile will help us provide better service recommendations. Your email address cannot be changed after registration.
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
