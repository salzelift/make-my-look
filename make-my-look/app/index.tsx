import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function IndexScreen() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');

  useEffect(() => {
    if (isLoading) return; // Wait for auth state to load

    if (!isAuthenticated) {
      router.replace('/(auth)/welcome');
      return;
    }

    // Redirect based on user type
    if (user?.userType === 'OWNER') {
      router.replace('/(tabs)/owner-dashboard');
    } else {
      router.replace('/(tabs)/');
    }
  }, [isAuthenticated, user, isLoading]);

  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor }}>
      <ActivityIndicator size="large" color="#000" />
    </View>
  );
}