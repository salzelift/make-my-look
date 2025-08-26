import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="flex-1 px-6 pt-8">
            {/* Header */}
            <View className="mb-12">
              <TouchableOpacity 
                onPress={() => router.back()}
                className="flex-row items-center mb-8"
              >
                <ArrowLeft size={20} color={textColor} />
                <Text style={{ color: textColor }} className="text-lg ml-2 font-medium">
                  Back
                </Text>
              </TouchableOpacity>
              
              <View className="items-center">
                <View className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 items-center justify-center mb-6 shadow-lg">
                  <Text className="text-white text-2xl">✂️</Text>
                </View>
                
                <Text style={{ color: textColor }} className="text-4xl font-bold mb-3 text-center">
                  Welcome Back
                </Text>
                <Text style={{ color: textColor }} className="text-lg opacity-70 text-center leading-6">
                  Sign in to your account to continue
                </Text>
              </View>
            </View>

            {/* Form */}
            <Card variant="elevated" style={{ marginBottom: 32 }}>
              <View className="space-y-6">
                <Input
                  label="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                  variant="filled"
                  leftIcon={<Mail size={20} color={textColor} />}
                  helperText="We'll never share your email"
                />

                <Input
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  error={errors.password}
                  variant="filled"
                  leftIcon={<Lock size={20} color={textColor} />}
                  rightIcon={
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={20} color={textColor} /> : <Eye size={20} color={textColor} />}
                    </TouchableOpacity>
                  }
                />

                <Button
                  title="Sign In"
                  onPress={handleLogin}
                  loading={loading}
                  size="xl"
                  variant="primary"
                  style={{ marginTop: 8 }}
                />
              </View>
            </Card>

            {/* Footer */}
            <View className="items-center mb-8">
              <TouchableOpacity onPress={() => router.push('/(auth)/register-choice')}>
                <Text style={{ color: textColor }} className="text-base">
                  Don't have an account?{' '}
                  <Text className="font-semibold underline text-primary-600">
                    Sign Up
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}