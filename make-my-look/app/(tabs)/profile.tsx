import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ProfileScreen() {
  const { user, isAuthenticated, logout } = useAuth();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/welcome');
      return;
    }

    if (user?.userType === 'OWNER') {
      router.replace('/(tabs)/owner-profile');
      return;
    }
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout }
      ]
    );
  };

  if (!isAuthenticated || user?.userType !== 'CUSTOMER') {
    return null; // Will redirect
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-8">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="w-24 h-24 rounded-full bg-black items-center justify-center mb-4">
              <Text className="text-white text-3xl">👤</Text>
            </View>
            <Text style={{ color: textColor }} className="text-2xl font-bold mb-1">
              {user?.name}
            </Text>
            <Text style={{ color: textColor }} className="text-base opacity-70">
              Customer Account
            </Text>
          </View>

          {/* Profile Information */}
          <Card style={{ marginBottom: 24 }}>
            <Text style={{ color: textColor }} className="text-xl font-bold mb-4">
              Profile Information
            </Text>
            
            <View className="space-y-4">
              <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
                <Text style={{ color: textColor }} className="text-base opacity-70">
                  Email
                </Text>
                <Text style={{ color: textColor }} className="text-base font-medium">
                  {user?.email}
                </Text>
              </View>
              
              <View className="flex-row justify-between items-center py-2 border-b border-gray-200">
                <Text style={{ color: textColor }} className="text-base opacity-70">
                  Phone
                </Text>
                <Text style={{ color: textColor }} className="text-base font-medium">
                  {user?.phoneNumber}
                </Text>
              </View>
              
              <View className="flex-row justify-between items-center py-2">
                <Text style={{ color: textColor }} className="text-base opacity-70">
                  Account Type
                </Text>
                <Text style={{ color: textColor }} className="text-base font-medium">
                  Customer
                </Text>
              </View>
            </View>
            
            <Button
              title="Edit Profile"
              onPress={() => router.push('/customer/edit-profile')}
              variant="outline"
              style={{ marginTop: 16 }}
            />
          </Card>

          {/* Quick Actions */}
          <Card style={{ marginBottom: 24 }}>
            <Text style={{ color: textColor }} className="text-xl font-bold mb-4">
              Quick Actions
            </Text>
            
            <View className="space-y-3">
              <TouchableOpacity 
                onPress={() => router.push('/(tabs)/bookings')}
                className="flex-row justify-between items-center py-3"
              >
                <View className="flex-row items-center">
                  <Text style={{ color: textColor }} className="text-lg mr-3">📅</Text>
                  <Text style={{ color: textColor }} className="text-base">My Bookings</Text>
                </View>
                <Text style={{ color: textColor }} className="text-lg">→</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => router.push('/(tabs)/search')}
                className="flex-row justify-between items-center py-3"
              >
                <View className="flex-row items-center">
                  <Text style={{ color: textColor }} className="text-lg mr-3">🔍</Text>
                  <Text style={{ color: textColor }} className="text-base">Find Salons</Text>
                </View>
                <Text style={{ color: textColor }} className="text-lg">→</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => router.push('/customer/preferences')}
                className="flex-row justify-between items-center py-3"
              >
                <View className="flex-row items-center">
                  <Text style={{ color: textColor }} className="text-lg mr-3">⚙️</Text>
                  <Text style={{ color: textColor }} className="text-base">Preferences</Text>
                </View>
                <Text style={{ color: textColor }} className="text-lg">→</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Support */}
          <Card style={{ marginBottom: 24 }}>
            <Text style={{ color: textColor }} className="text-xl font-bold mb-4">
              Support
            </Text>
            
            <View className="space-y-3">
              <TouchableOpacity className="flex-row justify-between items-center py-3">
                <View className="flex-row items-center">
                  <Text style={{ color: textColor }} className="text-lg mr-3">❓</Text>
                  <Text style={{ color: textColor }} className="text-base">Help & FAQ</Text>
                </View>
                <Text style={{ color: textColor }} className="text-lg">→</Text>
              </TouchableOpacity>
              
              <TouchableOpacity className="flex-row justify-between items-center py-3">
                <View className="flex-row items-center">
                  <Text style={{ color: textColor }} className="text-lg mr-3">📞</Text>
                  <Text style={{ color: textColor }} className="text-base">Contact Support</Text>
                </View>
                <Text style={{ color: textColor }} className="text-lg">→</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Logout */}
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            style={{ marginBottom: 24 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}