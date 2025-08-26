import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ArrowLeft, User, Building2, Sparkles, Star } from 'lucide-react-native';

export default function RegisterChoiceScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 pt-8 pb-8">
          {/* Header */}
          <View className="mb-8">
                      <TouchableOpacity 
              onPress={() => router.back()}
              className="flex-row items-center mb-6"
            >
              <ArrowLeft size={20} color={textColor} />
              <Text style={{ color: textColor }} className="text-lg ml-2 font-medium">
                Back
              </Text>
            </TouchableOpacity>
            
            <View className="items-center">
              <View 
                className="w-16 h-16 rounded-full items-center justify-center mb-4 shadow-lg"
                style={{ backgroundColor: '#667eea' }}
              >
                <Sparkles size={28} color="#FFFFFF" />
              </View>
              
              <Text style={{ color: textColor }} className="text-3xl font-bold mb-2 text-center">
                Join Salon
              </Text>
              <Text style={{ color: textColor }} className="text-base opacity-70 text-center leading-5">
                Choose how you'd like to use our platform
              </Text>
            </View>
        </View>

        {/* Choice Cards */}
        <View className="space-y-4 flex-1">
          {/* Customer Card */}
                      <Card variant="elevated" style={{ padding: 20 }}>
              <View className="items-center">
                <View 
                  className="w-14 h-14 rounded-full items-center justify-center mb-4 shadow-md"
                  style={{ backgroundColor: '#3b82f6' }}
                >
                  <User size={24} color="#FFFFFF" />
                </View>
                
                <Text style={{ color: textColor }} className="text-xl font-bold mb-2 text-center">
                  I'm a Customer
                </Text>
                
                <Text style={{ color: textColor }} className="text-sm text-center opacity-70 mb-4 leading-5">
                  Book appointments at your favorite salons and discover new beauty services
                </Text>
                
                <View className="w-full space-y-2 mb-4">
                  <View className="flex-row items-center justify-center">
                    <Star size={14} color="#22C55E" />
                    <Text style={{ color: textColor }} className="text-xs ml-2 opacity-70">
                      Browse premium salons
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-center">
                    <Star size={14} color="#22C55E" />
                    <Text style={{ color: textColor }} className="text-xs ml-2 opacity-70">
                      Easy booking process
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-center">
                    <Star size={14} color="#22C55E" />
                    <Text style={{ color: textColor }} className="text-xs ml-2 opacity-70">
                      Manage appointments
                    </Text>
                  </View>
                </View>
                
                <View className="w-full">
                  <Button
                    title="Continue as Customer"
                    onPress={() => router.push('/(auth)/register-customer')}
                    variant="primary"
                    size="medium"
                  />
                </View>
              </View>
            </Card>

          {/* Owner Card */}
                      <Card variant="elevated" style={{ padding: 20 }}>
              <View className="items-center">
                <View 
                  className="w-14 h-14 rounded-full items-center justify-center mb-4 shadow-md"
                  style={{ backgroundColor: '#667eea' }}
                >
                  <Building2 size={24} color="#FFFFFF" />
                </View>
                
                <Text style={{ color: textColor }} className="text-xl font-bold mb-2 text-center">
                  I'm a Salon Owner
                </Text>
                
                <Text style={{ color: textColor }} className="text-sm text-center opacity-70 mb-4 leading-5">
                  Manage your salon, services, and bookings. Grow your business with our platform
                </Text>
                
                <View className="w-full space-y-2 mb-4">
                  <View className="flex-row items-center justify-center">
                    <Star size={14} color="#F2751A" />
                    <Text style={{ color: textColor }} className="text-xs ml-2 opacity-70">
                      Manage multiple stores
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-center">
                    <Star size={14} color="#F2751A" />
                    <Text style={{ color: textColor }} className="text-xs ml-2 opacity-70">
                      Track bookings & revenue
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-center">
                    <Star size={14} color="#F2751A" />
                    <Text style={{ color: textColor }} className="text-xs ml-2 opacity-70">
                      Grow your business
                    </Text>
                  </View>
                </View>
                
                <View className="w-full">
                  <Button
                    title="Continue as Owner"
                    onPress={() => router.push('/(auth)/register-owner')}
                    variant="outline"
                    size="medium"
                  />
                </View>
              </View>
            </Card>
        </View>

        {/* Footer */}
        <View className="items-center mt-6">
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={{ color: textColor }} className="text-sm">
              Already have an account?{' '}
              <Text className="font-semibold underline text-primary-600">
                Sign In
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}