import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { router, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ownersAPI } from '@/services/api';
import { ArrowLeft, User, Phone, Mail, Save } from 'lucide-react-native';

interface FormData {
  name: string;
  phoneNumber: string;
}

interface FormErrors {
  name?: string;
  phoneNumber?: string;
}

export default function EditProfileScreen() {
  const { user, updateUser, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phoneNumber: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/welcome');
      return;
    }

    if (user?.userType !== 'OWNER') {
      router.replace('/(customer)/(tabs)/profile');
      return;
    }

    // Initialize form with current user data
    if (user) {
      setFormData({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [isAuthenticated, user]);

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

  const handleSave = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      setLoading(true);

      // Check if anything actually changed
      const hasChanges = 
        formData.name !== user?.name || 
        formData.phoneNumber !== user?.phoneNumber;

      if (!hasChanges) {
        Alert.alert('No Changes', 'No changes were made to your profile.');
        setLoading(false);
        return;
      }

      const updateData: { name?: string; phoneNumber?: string } = {};
      
      if (formData.name !== user?.name) {
        updateData.name = formData.name.trim();
      }
      
      if (formData.phoneNumber !== user?.phoneNumber) {
        updateData.phoneNumber = formData.phoneNumber.replace(/\s+/g, '').replace(/\D/g, '');
      }

      await ownersAPI.updateProfile(updateData);

      // Update user context with new data
      if (user) {
        const updatedUser = {
          ...user,
          ...updateData,
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
      formData.phoneNumber !== user?.phoneNumber;

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

  if (!isAuthenticated || user?.userType !== 'OWNER') {
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
            <View className="w-24 h-24 rounded-full bg-black items-center justify-center mb-4">
              <Text className="text-white text-3xl">🏪</Text>
            </View>
            <Text style={{ color: textColor }} className="text-lg font-medium opacity-70">
              Salon Owner
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
            <View className="bg-blue-50 rounded-lg p-4">
              <View className="flex-row items-start">
                <Text className="text-blue-600 text-sm mr-2">ℹ️</Text>
                <View className="flex-1">
                  <Text style={{ color: textColor }} className="text-sm font-medium mb-1">
                    Profile Update
                  </Text>
                  <Text style={{ color: textColor }} className="text-xs opacity-70 leading-4">
                    Changes to your profile will be reflected across all your stores and bookings. Your email address cannot be changed after registration.
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
