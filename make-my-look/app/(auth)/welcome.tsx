import React from 'react';
import { View, Text, SafeAreaView, StatusBar, Image } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Sparkles, Scissors, Star } from 'lucide-react-native';

export default function WelcomeScreen() {
  const { isAuthenticated, user } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.userType === 'OWNER') {
        router.replace('/(owner)/(tabs)/dashboard');
      } else {
        router.replace('/(customer)/(tabs)');
      }
    }
  }, [isAuthenticated, user]);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      
      <View className="flex-1 px-6 justify-center">
        {/* Hero Section */}
        <View className="items-center mb-16">
          {/* Logo */}
          <View className="relative mb-8">
            <Image source={require('@/assets/images/icon.png')} className="w-60 h-60 rounded-full" />
          </View>
          
          {/* Brand */}
          <Text style={{ color: textColor }} className="text-5xl font-bold text-center mb-3 tracking-tight">
            Book My Look
          </Text>
          <Text style={{ color: textColor }} className="text-xl text-center opacity-80 font-medium">
            Book your perfect look
          </Text>
        </View>

        {/* Features */}
        <Card variant="elevated" style={{ marginBottom: 24 }}>
          <View className="space-y-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-success-100 rounded-full items-center justify-center mr-4">
                <Star size={20} color="#22C55E" />
              </View>
              <View className="flex-1">
                <Text style={{ color: textColor }} className="text-lg font-semibold mb-1">
                  Premium Salons
                </Text>
                <Text style={{ color: textColor }} className="text-sm opacity-70">
                  Handpicked salons with verified quality
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-accent-100 rounded-full items-center justify-center mr-4">
                <Sparkles size={20} color="#F2751A" />
              </View>
              <View className="flex-1">
                <Text style={{ color: textColor }} className="text-lg font-semibold mb-1">
                  Easy Booking
                </Text>
                <Text style={{ color: textColor }} className="text-sm opacity-70">
                  Book appointments in just a few taps
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-4">
                <Scissors size={20} color="#475569" />
              </View>
              <View className="flex-1">
                <Text style={{ color: textColor }} className="text-lg font-semibold mb-1">
                  Expert Services
                </Text>
                <Text style={{ color: textColor }} className="text-sm opacity-70">
                  Professional stylists and beauty experts
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Action Buttons */}
        <View className="space-y-4 mb-8 gap-4">
          <Button
            title="Sign In"
            onPress={() => router.push('/(auth)/login')}
            variant="primary"
            size="xl"
            icon="🔐"
          />
          
          <Button
            title="Create Account"
            onPress={() => router.push('/(auth)/register-choice')}
            variant="outline"
            size="xl"
            icon="✨"
          />
        </View>

        {/* Footer */}
        <View className="items-center">
          <Text style={{ color: textColor }} className="text-sm text-center opacity-60 leading-5">
            By continuing, you agree to our{' '}
            <Text className="font-semibold underline">Terms of Service</Text>
            {' '}and{' '}
            <Text className="font-semibold underline">Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}