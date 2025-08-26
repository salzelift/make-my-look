import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  User, 
  Calendar, 
  Search, 
  Settings, 
  HelpCircle, 
  Phone, 
  LogOut, 
  Edit3, 
  Crown,
  Star,
  MapPin,
  Clock
} from 'lucide-react-native';

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
      router.replace('/(owner)/(tabs)/profile');
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
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-8">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="relative mb-6">
              <View className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 items-center justify-center shadow-lg">
                <User size={40} color="#FFFFFF" />
              </View>
              <View className="absolute -bottom-1 -right-1 w-8 h-8 bg-accent-500 rounded-full items-center justify-center border-2 border-white">
                <Crown size={16} color="#FFFFFF" />
              </View>
            </View>
            
            <Text style={{ color: textColor }} className="text-2xl font-bold mb-2 text-center">
              {user?.name}
            </Text>
            <Text style={{ color: textColor }} className="text-base opacity-70 text-center">
              Premium Customer
            </Text>
            
            <View className="flex-row items-center mt-3 bg-success-100 px-4 py-2 rounded-full">
              <Star size={16} color="#22C55E" />
              <Text className="text-success-700 text-sm font-medium ml-2">
                Loyalty Member
              </Text>
            </View>
          </View>

          {/* Profile Information */}
          <Card variant="elevated" style={{ marginBottom: 24 }}>
            <View className="flex-row items-center justify-between mb-6">
              <Text style={{ color: textColor }} className="text-xl font-bold">
                Profile Information
              </Text>
              <TouchableOpacity 
                onPress={() => router.push('/(customer)/(tabs)/profile')}
                className="flex-row items-center"
              >
                <Edit3 size={16} color={textColor} />
                <Text style={{ color: textColor }} className="text-sm font-medium ml-1">
                  Edit
                </Text>
              </TouchableOpacity>
            </View>
            
            <View className="space-y-4">
              <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-primary-100 rounded-full items-center justify-center mr-3">
                    <User size={16} color="#475569" />
                  </View>
                  <Text style={{ color: textColor }} className="text-base opacity-70">
                    Email
                  </Text>
                </View>
                <Text style={{ color: textColor }} className="text-base font-medium">
                  {user?.email}
                </Text>
              </View>
              
              <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-accent-100 rounded-full items-center justify-center mr-3">
                    <Phone size={16} color="#F2751A" />
                  </View>
                  <Text style={{ color: textColor }} className="text-base opacity-70">
                    Phone
                  </Text>
                </View>
                <Text style={{ color: textColor }} className="text-base font-medium">
                  {user?.phoneNumber}
                </Text>
              </View>
              
              <View className="flex-row justify-between items-center py-3">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-success-100 rounded-full items-center justify-center mr-3">
                    <Crown size={16} color="#22C55E" />
                  </View>
                  <Text style={{ color: textColor }} className="text-base opacity-70">
                    Account Type
                  </Text>
                </View>
                <Text style={{ color: textColor }} className="text-base font-medium">
                  Customer
                </Text>
              </View>
            </View>
          </Card>

          {/* Quick Actions */}
          <Card variant="elevated" style={{ marginBottom: 24 }}>
            <Text style={{ color: textColor }} className="text-xl font-bold mb-6">
              Quick Actions
            </Text>
            
            <View className="space-y-4">
              <TouchableOpacity 
                onPress={() => router.push('/(customer)/(tabs)/bookings')}
                className="flex-row justify-between items-center py-4 bg-primary-50 rounded-xl px-4"
              >
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-4">
                    <Calendar size={20} color="#475569" />
                  </View>
                  <View>
                    <Text style={{ color: textColor }} className="text-base font-semibold">
                      My Bookings
                    </Text>
                    <Text style={{ color: textColor }} className="text-sm opacity-70">
                      View and manage appointments
                    </Text>
                  </View>
                </View>
                <Text style={{ color: textColor }} className="text-lg">→</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => router.push('/(customer)/(tabs)/search')}
                className="flex-row justify-between items-center py-4 bg-accent-50 rounded-xl px-4"
              >
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-accent-100 rounded-full items-center justify-center mr-4">
                    <Search size={20} color="#F2751A" />
                  </View>
                  <View>
                    <Text style={{ color: textColor }} className="text-base font-semibold">
                      Find Salons
                    </Text>
                    <Text style={{ color: textColor }} className="text-sm opacity-70">
                      Discover new beauty services
                    </Text>
                  </View>
                </View>
                <Text style={{ color: textColor }} className="text-lg">→</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Support */}
          <Card variant="elevated" style={{ marginBottom: 24 }}>
            <Text style={{ color: textColor }} className="text-xl font-bold mb-6">
              Support & Help
            </Text>
            
            <View className="space-y-4">
              <TouchableOpacity className="flex-row justify-between items-center py-4 bg-gray-50 rounded-xl px-4">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-4">
                    <HelpCircle size={20} color="#6B7280" />
                  </View>
                  <View>
                    <Text style={{ color: textColor }} className="text-base font-semibold">
                      Help & FAQ
                    </Text>
                    <Text style={{ color: textColor }} className="text-sm opacity-70">
                      Find answers to common questions
                    </Text>
                  </View>
                </View>
                <Text style={{ color: textColor }} className="text-lg">→</Text>
              </TouchableOpacity>
              
              <TouchableOpacity className="flex-row justify-between items-center py-4 bg-gray-50 rounded-xl px-4">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-4">
                    <Phone size={20} color="#6B7280" />
                  </View>
                  <View>
                    <Text style={{ color: textColor }} className="text-base font-semibold">
                      Contact Support
                    </Text>
                    <Text style={{ color: textColor }} className="text-sm opacity-70">
                      Get help from our team
                    </Text>
                  </View>
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
            size="large"
            icon="🚪"
            style={{ marginBottom: 24 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}