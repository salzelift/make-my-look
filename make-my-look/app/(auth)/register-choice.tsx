import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function RegisterChoiceScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <View className="flex-1 px-6 pt-12">
        {/* Header */}
        <View className="items-center mb-12">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="absolute left-0 top-0"
          >
            <Text style={{ color: textColor }} className="text-lg">← Back</Text>
          </TouchableOpacity>
          
          <Text style={{ color: textColor }} className="text-3xl font-bold mb-2">
            Join Salon
          </Text>
          <Text style={{ color: textColor }} className="text-base opacity-70 text-center">
            Choose how you'd like to use our platform
          </Text>
        </View>

        {/* Choice Cards */}
        <View className="space-y-6">
          {/* Customer Card */}
          <TouchableOpacity onPress={() => router.push('/(auth)/register-customer')}>
            <Card style={{ padding: 24 }}>
              <View className="items-center">
                <View className="w-16 h-16 rounded-full bg-black items-center justify-center mb-4">
                  <Text className="text-white text-2xl">👤</Text>
                </View>
                <Text style={{ color: textColor }} className="text-xl font-bold mb-2">
                  I'm a Customer
                </Text>
                <Text style={{ color: textColor }} className="text-base text-center opacity-70 mb-4">
                  Book appointments at your favorite salons and discover new beauty services
                </Text>
                <View className="w-full">
                  <Button
                    title="Continue as Customer"
                    onPress={() => router.push('/(auth)/register-customer')}
                    variant="outline"
                  />
                </View>
              </View>
            </Card>
          </TouchableOpacity>

          {/* Owner Card */}
          <TouchableOpacity onPress={() => router.push('/(auth)/register-owner')}>
            <Card style={{ padding: 24 }}>
              <View className="items-center">
                <View className="w-16 h-16 rounded-full bg-black items-center justify-center mb-4">
                  <Text className="text-white text-2xl">🏪</Text>
                </View>
                <Text style={{ color: textColor }} className="text-xl font-bold mb-2">
                  I'm a Salon Owner
                </Text>
                <Text style={{ color: textColor }} className="text-base text-center opacity-70 mb-4">
                  Manage your salon, services, and bookings. Grow your business with our platform
                </Text>
                <View className="w-full">
                  <Button
                    title="Continue as Owner"
                    onPress={() => router.push('/(auth)/register-owner')}
                    variant="outline"
                  />
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="mt-8 items-center">
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={{ color: textColor }} className="text-base">
              Already have an account?{' '}
              <Text className="font-semibold underline">Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}