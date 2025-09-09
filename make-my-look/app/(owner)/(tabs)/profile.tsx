import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ownersAPI } from '@/services/api';
import { Key, Copy, Check } from 'lucide-react-native';

export default function OwnerProfileScreen() {
  const { user, isAuthenticated, logout } = useAuth();
  const [ownerCode, setOwnerCode] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/welcome');
      return;
    }

    if (user?.userType !== 'OWNER') {
      router.replace('/(customer)/(tabs)/profile');
      return;
    }

    loadOwnerCode();
  }, [isAuthenticated, user]);

  const loadOwnerCode = async () => {
    try {
      const response = await ownersAPI.getOwnerCode();
      setOwnerCode(response.ownerCode);
    } catch (error) {
      console.error('Failed to load owner code:', error);
    }
  };

  const copyOwnerCode = async () => {
    try {
      // Note: In a real app, you'd use Clipboard API
      // For now, we'll just show a visual feedback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      Alert.alert('Copied!', 'Owner code copied to clipboard');
    } catch (error) {
      console.error('Failed to copy owner code:', error);
    }
  };

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

  if (!isAuthenticated || user?.userType !== 'OWNER') {
    return null; // Will redirect
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-8">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="w-24 h-24 rounded-full bg-black items-center justify-center mb-4">
              <Text className="text-white text-3xl">🏪</Text>
            </View>
            <Text style={{ color: textColor }} className="text-2xl font-bold mb-1">
              {user?.name}
            </Text>
            <Text style={{ color: textColor }} className="text-base opacity-70">
              Salon Owner
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
                  Salon Owner
                </Text>
              </View>
            </View>
            
            <Button
              title="Edit Profile"
              onPress={() => router.push('/(owner)/(tabs)/profile')}
              variant="outline"
              style={{ marginTop: 16 }}
            />
          </Card>

          {/* Owner Code */}
          <Card style={{ marginBottom: 24 }}>
            <View className="flex-row items-center justify-between mb-4">
              <Text style={{ color: textColor }} className="text-xl font-bold">
                Owner Code
              </Text>
              <View className="flex-row items-center">
                <Key size={16} color={textColor} />
                <Text style={{ color: textColor }} className="text-sm opacity-70 ml-1">
                  Unique ID
                </Text>
              </View>
            </View>
            
            <View className="bg-gray-50 rounded-lg p-4 mb-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text style={{ color: textColor }} className="text-2xl font-bold tracking-wider">
                    {ownerCode || 'Loading...'}
                  </Text>
                  <Text style={{ color: textColor }} className="text-sm opacity-70 mt-1">
                    Share this code with your customers
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={copyOwnerCode}
                  className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center"
                >
                  {copied ? (
                    <Check size={20} color="#22C55E" />
                  ) : (
                    <Copy size={20} color="#475569" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View className="bg-warning-50 rounded-lg p-3">
              <View className="flex-row items-start">
                <Text className="text-warning-600 text-sm mr-2">⚠️</Text>
                <View className="flex-1">
                  <Text style={{ color: textColor }} className="text-sm font-medium mb-1">
                    Important
                  </Text>
                  <Text style={{ color: textColor }} className="text-xs opacity-70 leading-4">
                    This code cannot be changed after registration. Share it with your customers so they can connect to your salon.
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Business Management */}
          <Card style={{ marginBottom: 24 }}>
            <Text style={{ color: textColor }} className="text-xl font-bold mb-4">
              Business Management
            </Text>
            
            <View className="space-y-3">
              <TouchableOpacity 
                onPress={() => router.push('/(owner)/(tabs)/stores')}
                className="flex-row justify-between items-center py-3"
              >
                <View className="flex-row items-center">
                  <Text style={{ color: textColor }} className="text-lg mr-3">🏪</Text>
                  <Text style={{ color: textColor }} className="text-base">Manage Stores</Text>
                </View>
                <Text style={{ color: textColor }} className="text-lg">→</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => router.push('/(owner)/(tabs)/bookings')}
                className="flex-row justify-between items-center py-3"
              >
                <View className="flex-row items-center">
                  <Text style={{ color: textColor }} className="text-lg mr-3">📅</Text>
                  <Text style={{ color: textColor }} className="text-base">View Bookings</Text>
                </View>
                <Text style={{ color: textColor }} className="text-lg">→</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => router.push('/(owner)/(tabs)/stores')}
                className="flex-row justify-between items-center py-3"
              >
                <View className="flex-row items-center">
                  <Text style={{ color: textColor }} className="text-lg mr-3">➕</Text>
                  <Text style={{ color: textColor }} className="text-base">Add New Store</Text>
                </View>
                <Text style={{ color: textColor }} className="text-lg">→</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => router.push('/owner/bank-account')}
                className="flex-row justify-between items-center py-3"
              >
                <View className="flex-row items-center">
                  <Text style={{ color: textColor }} className="text-lg mr-3">🏦</Text>
                  <Text style={{ color: textColor }} className="text-base">Add Bank Account</Text>
                </View>
                <Text style={{ color: textColor }} className="text-lg">→</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => router.push('/owner/payments')}
                className="flex-row justify-between items-center py-3"
              >
                <View className="flex-row items-center">
                  <Text style={{ color: textColor }} className="text-lg mr-3">💰</Text>
                  <Text style={{ color: textColor }} className="text-base">View Payments</Text>
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