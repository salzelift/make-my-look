import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { customersAPI } from '@/services/api';
import { Key, ArrowRight } from 'lucide-react-native';

export default function EnterOwnerCodeScreen() {
  const [ownerCode, setOwnerCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const validateOwnerCode = (code: string) => {
    if (!code.trim()) {
      return 'Owner code is required';
    }
    if (!/^[A-Za-z0-9]{6,10}$/.test(code)) {
      return 'Owner code must be 6-10 alphanumeric characters';
    }
    return '';
  };

  const handleSubmit = async () => {
    const validationError = validateOwnerCode(ownerCode);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get customer profile to get customer ID
      const customerProfile = await customersAPI.getProfile();
      
      // Enter owner code
      const response = await customersAPI.enterOwnerCode(ownerCode.toUpperCase(), customerProfile.customer.id);
      
      Alert.alert(
        'Success!',
        `You are now connected to ${response.owner.name}'s salon. You can now browse and book services.`,
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/(customer)/(tabs)/index')
          }
        ]
      );
    } catch (error: any) {
      setError(error.message || 'Failed to connect to salon. Please check the owner code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Owner Code',
      'You can enter the owner code later from your dashboard. You will need it to access salon services.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Skip', 
          onPress: () => router.replace('/(customer)/(tabs)/index')
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className="flex-1 px-6 pt-12">
          {/* Header */}
          <View className="items-center mb-8">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="absolute left-0 top-0"
            >
              <Text style={{ color: textColor }} className="text-lg">← Back</Text>
            </TouchableOpacity>
            
            <View className="w-20 h-20 rounded-full bg-primary-100 items-center justify-center mb-6">
              <Key size={32} color="#667eea" />
            </View>
            
            <Text style={{ color: textColor }} className="text-3xl font-bold mb-2">
              Connect to Salon
            </Text>
            <Text style={{ color: textColor }} className="text-base opacity-70 text-center px-4">
              Enter the owner code provided by your salon to access their services and book appointments
            </Text>
          </View>

          {/* Owner Code Input */}
          <Card style={{ marginBottom: 24 }}>
            <View className="items-center mb-6">
              <Text style={{ color: textColor }} className="text-lg font-semibold mb-2">
                Owner Code
              </Text>
              <Text style={{ color: textColor }} className="text-sm opacity-70 text-center">
                Ask your salon owner for their unique code
              </Text>
            </View>
            
            <Input
              label="Enter Owner Code"
              value={ownerCode}
              onChangeText={(text) => {
                setOwnerCode(text.toUpperCase());
                setError('');
              }}
              placeholder="e.g., SALON123"
              autoCapitalize="characters"
              error={error}
              style={{ marginBottom: 16 }}
            />

            <Button
              title="Connect to Salon"
              onPress={handleSubmit}
              loading={loading}
              size="large"
              icon="🔑"
              style={{ marginBottom: 12 }}
            />

            <TouchableOpacity onPress={handleSkip}>
              <Text style={{ color: textColor }} className="text-center text-base opacity-70">
                Skip for now
              </Text>
            </TouchableOpacity>
          </Card>

          {/* Information Card */}
          <Card variant="outlined" style={{ marginBottom: 24 }}>
            <View className="flex-row items-start">
              <View className="w-8 h-8 rounded-full bg-info-100 items-center justify-center mr-3 mt-1">
                <Text className="text-info-600 text-sm font-bold">i</Text>
              </View>
              <View className="flex-1">
                <Text style={{ color: textColor }} className="text-base font-semibold mb-2">
                  What is an Owner Code?
                </Text>
                <Text style={{ color: textColor }} className="text-sm opacity-70 leading-5">
                  Each salon owner has a unique code that allows customers to access their specific salon's services. 
                  You'll need this code to browse services, book appointments, and make payments.
                </Text>
              </View>
            </View>
          </Card>

          {/* Help Card */}
          <Card variant="outlined">
            <View className="flex-row items-start">
              <View className="w-8 h-8 rounded-full bg-warning-100 items-center justify-center mr-3 mt-1">
                <Text className="text-warning-600 text-sm font-bold">?</Text>
              </View>
              <View className="flex-1">
                <Text style={{ color: textColor }} className="text-base font-semibold mb-2">
                  Don't have a code?
                </Text>
                <Text style={{ color: textColor }} className="text-sm opacity-70 leading-5">
                  Contact your salon directly to get their owner code. You can also enter it later from your dashboard.
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}