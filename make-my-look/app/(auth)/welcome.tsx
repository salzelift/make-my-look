import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function WelcomeScreen() {
  const { isAuthenticated, user } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.userType === 'OWNER') {
        router.replace('/(tabs)/owner-dashboard');
      } else {
        router.replace('/(tabs)/');
      }
    }
  }, [isAuthenticated, user]);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <View className="flex-1 px-6 justify-center">
        {/* Logo/Brand Section */}
        <View className="items-center mb-12">
          <View className="w-24 h-24 rounded-full border-2 border-black items-center justify-center mb-6">
            <Text style={{ color: textColor }} className="text-3xl font-bold">✂️</Text>
          </View>
          <Text style={{ color: textColor }} className="text-4xl font-bold text-center mb-2">
            Salon
          </Text>
          <Text style={{ color: textColor }} className="text-xl text-center opacity-70">
            Book your perfect look
          </Text>
        </View>

        {/* Tagline */}
        <View className="mb-12">
          <Text style={{ color: textColor }} className="text-lg text-center leading-7 opacity-80">
            Connect with premium salons and book your favorite beauty services with ease
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="space-y-4">
          <Button
            title="Sign In"
            onPress={() => router.push('/(auth)/login')}
            variant="primary"
            size="large"
          />
          
          <Button
            title="Create Account"
            onPress={() => router.push('/(auth)/register-choice')}
            variant="outline"
            size="large"
          />
        </View>

        {/* Footer */}
        <View className="mt-12">
          <Text style={{ color: textColor }} className="text-sm text-center opacity-60">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}