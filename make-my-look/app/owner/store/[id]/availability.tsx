import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { storesAPI } from '@/services/api';

interface DayAvailability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export default function StoreAvailabilityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const [availability, setAvailability] = useState<DayAvailability[]>([
    { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isActive: true }, // Monday
    { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isActive: true }, // Tuesday
    { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isActive: true }, // Wednesday
    { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isActive: true }, // Thursday
    { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', isActive: true }, // Friday
    { dayOfWeek: 6, startTime: '10:00', endTime: '16:00', isActive: true }, // Saturday
    { dayOfWeek: 0, startTime: '10:00', endTime: '16:00', isActive: false }, // Sunday
  ]);
  const [loading, setLoading] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const updateDayAvailability = (dayOfWeek: number, field: string, value: any) => {
    setAvailability(prev => prev.map(day => 
      day.dayOfWeek === dayOfWeek 
        ? { ...day, [field]: value }
        : day
    ));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Validate time slots
      for (const day of availability) {
        if (day.isActive) {
          const start = new Date(`2000-01-01T${day.startTime}:00`);
          const end = new Date(`2000-01-01T${day.endTime}:00`);
          
          if (start >= end) {
            Alert.alert('Invalid Time', `End time must be after start time for ${dayNames[day.dayOfWeek]}`);
            return;
          }
        }
      }

      const activeAvailability = availability.filter(day => day.isActive);
      
      await storesAPI.setStoreAvailability(id!, activeAvailability);
      
      Alert.alert('Success', 'Store availability updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Failed to update availability:', error);
      Alert.alert('Error', 'Failed to update store availability');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || user?.userType !== 'OWNER') {
    return null;
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-8">
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="mr-4"
            >
              <Text style={{ color: textColor }} className="text-lg">← Back</Text>
            </TouchableOpacity>
            <Text style={{ color: textColor }} className="text-2xl font-bold flex-1">
              Operating Hours
            </Text>
          </View>

          {/* Instructions */}
          <Card style={{ marginBottom: 24 }}>
            <Text style={{ color: textColor }} className="text-lg font-bold mb-2">
              Set Your Store Hours
            </Text>
            <Text style={{ color: textColor }} className="text-sm opacity-70">
              Configure when your salon is open for bookings. Customers will only be able to book during these hours.
            </Text>
          </Card>

          {/* Days Configuration */}
          <View className="space-y-4 mb-6">
            {availability.map((day) => (
              <Card key={day.dayOfWeek}>
                <View className="flex-row justify-between items-center mb-3">
                  <Text style={{ color: textColor }} className="text-lg font-semibold">
                    {dayNames[day.dayOfWeek]}
                  </Text>
                  
                  <TouchableOpacity
                    onPress={() => updateDayAvailability(day.dayOfWeek, 'isActive', !day.isActive)}
                    className={`px-3 py-1 rounded-full ${
                      day.isActive ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    <Text className={`text-sm font-semibold ${
                      day.isActive ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {day.isActive ? 'OPEN' : 'CLOSED'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {day.isActive && (
                  <View className="flex-row space-x-3">
                    <View className="flex-1">
                      <Input
                        label="Start Time"
                        value={day.startTime}
                        onChangeText={(text) => updateDayAvailability(day.dayOfWeek, 'startTime', text)}
                        placeholder="09:00"
                      />
                    </View>
                    
                    <View className="flex-1">
                      <Input
                        label="End Time"
                        value={day.endTime}
                        onChangeText={(text) => updateDayAvailability(day.dayOfWeek, 'endTime', text)}
                        placeholder="18:00"
                      />
                    </View>
                  </View>
                )}
              </Card>
            ))}
          </View>

          {/* Save Button */}
          <Button
            title="Save Operating Hours"
            onPress={handleSave}
            loading={loading}
            size="large"
            style={{ marginBottom: 24 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}