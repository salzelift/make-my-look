import React, { useState, useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Linking as RNLinking } from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
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
  const isMountedRef = useRef(true);

  const { login } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Handle deep linking when returning from forgot password
  useEffect(() => {
    const handleDeepLink = (url: string | null) => {
      if (url && url.includes('forgot-password-success')) {
        Alert.alert(
          'Password Reset Successful',
          'Your password has been reset successfully. Please login with your new password.',
          [{ text: 'OK' }]
        );
      }
    };

    // Listen for deep links while app is running
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    // Check if app was opened with a deep link
    Linking.getInitialURL().then(handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleForgotPassword = async () => {
    try {
      const forgotPasswordUrl = 'https://www.auracodelab.com/forgot-password';
      
      // Create deep link URL for redirect back to app after password reset
      // Format: bookmylook:///(auth)/login?forgot-password-success=true
      const redirectUrl = Linking.createURL('/(auth)/login', {
        scheme: 'bookmylook',
        queryParams: { 'forgot-password-success': 'true' },
      });
      
      // Pass redirect URL as query parameter to web page
      const urlWithRedirect = `${forgotPasswordUrl}?redirect=${encodeURIComponent(redirectUrl)}`;
      
      // Add a small delay to ensure the activity is ready
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Check if component is still mounted
      if (!isMountedRef.current) {
        return;
      }

      // Try to open in in-app browser first
      try {
        await WebBrowser.openBrowserAsync(urlWithRedirect, {
          showTitle: true,
          toolbarColor: backgroundColor,
          controlsColor: textColor,
          enableBarCollapsing: false,
        });
      } catch (browserError: any) {
        // If WebBrowser fails due to activity issue, use system browser as fallback
        if (browserError.message?.includes('activity is no longer available') || 
            browserError.message?.includes('no longer available')) {
          // Silently fallback to system browser
          if (isMountedRef.current) {
            const canOpen = await RNLinking.canOpenURL(urlWithRedirect);
            if (canOpen) {
              await RNLinking.openURL(urlWithRedirect);
            }
          }
        } else {
          // For other errors, try system browser
          if (isMountedRef.current) {
            try {
              await RNLinking.openURL(urlWithRedirect);
            } catch (fallbackError) {
              console.error('Failed to open URL:', fallbackError);
              Alert.alert('Error', 'Failed to open forgot password page. Please try again.');
            }
          }
        }
      }
    } catch (error: any) {
      // Only show error if component is still mounted and it's not an expected error
      if (isMountedRef.current) {
        const errorMessage = error?.message || String(error);
        if (!errorMessage.includes('activity is no longer available') && 
            !errorMessage.includes('no longer available')) {
          console.error('Error opening forgot password:', error);
          // Final fallback: try system browser
          try {
            const forgotPasswordUrl = 'https://www.auracodelab.com/forgot-password';
            const redirectUrl = Linking.createURL('/(auth)/login', {
              scheme: 'bookmylook',
              queryParams: { 'forgot-password-success': 'true' },
            });
            const urlWithRedirect = `${forgotPasswordUrl}?redirect=${encodeURIComponent(redirectUrl)}`;
            const canOpen = await RNLinking.canOpenURL(urlWithRedirect);
            if (canOpen) {
              await RNLinking.openURL(urlWithRedirect);
            } else {
              Alert.alert('Error', 'Unable to open the browser. Please check your device settings.');
            }
          } catch (fallbackError) {
            Alert.alert('Error', 'Failed to open forgot password page. Please try again.');
          }
        }
      }
    }
  };

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
            <View className="mb-12 mt-10">
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
              <View className="space-y-6 gap-6">
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

                <TouchableOpacity 
                  onPress={handleForgotPassword}
                  style={{ alignSelf: 'flex-end', marginTop: -8, marginBottom: 8 }}
                >
                  <Text style={{ color: textColor }} className="text-sm opacity-70 underline">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>

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