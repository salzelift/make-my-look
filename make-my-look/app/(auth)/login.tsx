import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { login } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
      // Navigation will be handled by the auth context
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="flex-1 px-6 pt-12">
            {/* Header */}
            <View className="items-center mb-12">
              <TouchableOpacity 
                onPress={() => router.back()}
                className="absolute left-0 top-0"
              >
                <Text style={{ color: textColor }} className="text-lg">← Back</Text>
              </TouchableOpacity>
              
              <View className="w-16 h-16 rounded-full border-2 border-black items-center justify-center mb-6">
                <Text style={{ color: textColor }} className="text-2xl">✂️</Text>
              </View>
              
              <Text style={{ color: textColor }} className="text-3xl font-bold mb-2">
                Welcome Back
              </Text>
              <Text style={{ color: textColor }} className="text-base opacity-70 text-center">
                Sign in to your account
              </Text>
            </View>

            {/* Form */}
            <View className="space-y-6">
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />

              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                error={errors.password}
              />

              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                size="large"
                style={{ marginTop: 24 }}
              />
            </View>

            {/* Footer */}
            <View className="mt-8 items-center">
              <TouchableOpacity onPress={() => router.push('/(auth)/register-choice')}>
                <Text style={{ color: textColor }} className="text-base">
                  Don't have an account?{' '}
                  <Text className="font-semibold underline">Sign Up</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}