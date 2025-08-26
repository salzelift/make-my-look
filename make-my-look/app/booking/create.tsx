import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { bookingsAPI, paymentsAPI } from '@/services/api';
import { TimeSlot } from '@/types';
import BookingPaymentButton from '@/components/booking-payment-button';

export default function CreateBookingScreen() {
  const params = useLocalSearchParams<{
    storeId: string;
    serviceId: string;
    storeName: string;
    serviceName: string;
    price: string;
    duration: string;
  }>();

  const { user, isAuthenticated } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [paymentPercentage, setPaymentPercentage] = useState<50 | 100>(100);
  const [notes, setNotes] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    if (!isAuthenticated || user?.userType !== 'CUSTOMER') {
      router.replace('/(auth)/welcome');
      return;
    }

    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (selectedDate && params.storeId && params.serviceId) {
      loadAvailableSlots();
    }
  }, [selectedDate]);

  const loadAvailableSlots = async () => {
    try {
      setSlotsLoading(true);
      const response = await bookingsAPI.getAvailableSlots(
        params.storeId!,
        params.serviceId!,
        selectedDate
      );
      setAvailableSlots(response.availableSlots);
      setSelectedSlot(null); // Reset selected slot when date changes
    } catch (error) {
      console.error('Failed to load available slots:', error);
      Alert.alert('Error', 'Failed to load available time slots');
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot) {
      Alert.alert('Missing Information', 'Please select a time slot');
      return;
    }

    // For both 50% and 100% payments, show payment screen
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    if (paymentPercentage === 100) {
      Alert.alert(
        'Payment & Booking Confirmed!',
        `Your appointment has been booked for ${selectedDate} at ${selectedSlot?.startTime}. Full payment has been processed successfully.`,
        [
          {
            text: 'View Bookings',
            onPress: () => router.push('/(customer)/(tabs)/bookings')
          }
        ]
      );
    } else {
      Alert.alert(
        'Partial Payment & Booking Confirmed!',
        `Your appointment has been booked for ${selectedDate} at ${selectedSlot?.startTime}. ${paymentPercentage}% payment has been processed. Please pay the remaining amount at the salon.`,
        [
          {
            text: 'View Bookings',
            onPress: () => router.push('/(customer)/(tabs)/bookings')
          }
        ]
      );
    }
    // Reset the form
    setShowPayment(false);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    Alert.alert(
      'Payment Failed',
      'Would you like to retry payment?',
      [
        {
          text: 'Retry Payment',
          onPress: () => {
            // The payment button will be re-enabled for retry
          }
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            setShowPayment(false);
          }
        }
      ]
    );
  };

  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) { // Next 14 days
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        })
      });
    }
    
    return dates;
  };

  const price = parseFloat(params.price || '0');
  const paymentAmount = (price * paymentPercentage) / 100;

  if (!isAuthenticated || user?.userType !== 'CUSTOMER') {
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
              Book Appointment
            </Text>
          </View>

          {/* Service Summary */}
          <Card style={{ marginBottom: 24 }}>
            <Text style={{ color: textColor }} className="text-xl font-bold mb-4">
              Service Details
            </Text>
            
            <View className="space-y-3">
              <View className="flex-row justify-between items-center">
                <Text style={{ color: textColor }} className="text-base opacity-70">
                  Salon
                </Text>
                <Text style={{ color: textColor }} className="text-base font-semibold">
                  {params.storeName}
                </Text>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text style={{ color: textColor }} className="text-base opacity-70">
                  Service
                </Text>
                <Text style={{ color: textColor }} className="text-base font-semibold">
                  {params.serviceName}
                </Text>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text style={{ color: textColor }} className="text-base opacity-70">
                  Duration
                </Text>
                <Text style={{ color: textColor }} className="text-base font-semibold">
                  {params.duration} minutes
                </Text>
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text style={{ color: textColor }} className="text-base opacity-70">
                  Price
                </Text>
                <Text style={{ color: textColor }} className="text-base font-semibold">
                  ${price.toFixed(2)}
                </Text>
              </View>
            </View>
          </Card>

          {/* Date Selection */}
          <Card style={{ marginBottom: 24 }}>
            <Text style={{ color: textColor }} className="text-xl font-bold mb-4">
              Select Date
            </Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row space-x-3">
                {generateDateOptions().map((date) => (
                  <TouchableOpacity
                    key={date.value}
                    onPress={() => setSelectedDate(date.value)}
                    className={`rounded-lg px-4 py-3 border ${
                      selectedDate === date.value 
                        ? 'bg-black border-black' 
                        : 'border-gray-300'
                    }`}
                  >
                    <Text className={`text-sm font-semibold text-center ${
                      selectedDate === date.value ? 'text-white' : 'text-black'
                    }`}>
                      {date.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </Card>

          {/* Time Slots */}
          <Card style={{ marginBottom: 24 }}>
            <Text style={{ color: textColor }} className="text-xl font-bold mb-4">
              Available Time Slots
            </Text>

            {slotsLoading ? (
              <View className="py-4">
                <Text style={{ color: textColor }} className="text-center opacity-70">
                  Loading available slots...
                </Text>
              </View>
            ) : availableSlots.length === 0 ? (
              <View className="py-4">
                <Text style={{ color: textColor }} className="text-center opacity-70">
                  No available slots for this date
                </Text>
              </View>
            ) : (
              <View className="flex-row flex-wrap">
                {availableSlots.map((slot, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedSlot(slot)}
                    className={`rounded-lg px-4 py-2 border mr-2 mb-2 ${
                      selectedSlot?.startTime === slot.startTime 
                        ? 'bg-black border-black' 
                        : 'border-gray-300'
                    }`}
                  >
                    <Text className={`text-sm font-semibold ${
                      selectedSlot?.startTime === slot.startTime ? 'text-white' : 'text-black'
                    }`}>
                      {slot.startTime}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Card>

          {/* Payment Options */}
          <Card style={{ marginBottom: 24 }}>
            <Text style={{ color: textColor }} className="text-xl font-bold mb-4">
              Payment Options
            </Text>
            
            <View className="space-y-3">
              <TouchableOpacity
                onPress={() => setPaymentPercentage(100)}
                className={`p-4 rounded-lg border ${
                  paymentPercentage === 100 ? 'bg-black border-black' : 'border-gray-300'
                }`}
              >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className={`text-base font-semibold ${
                      paymentPercentage === 100 ? 'text-white' : 'text-black'
                    }`}>
                      Pay Full Amount
                    </Text>
                    <Text className={`text-sm ${
                      paymentPercentage === 100 ? 'text-white opacity-80' : 'text-black opacity-70'
                    }`}>
                      Complete payment now
                    </Text>
                  </View>
                  <Text className={`text-lg font-bold ${
                    paymentPercentage === 100 ? 'text-white' : 'text-black'
                  }`}>
                    ${price.toFixed(2)}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setPaymentPercentage(50)}
                className={`p-4 rounded-lg border ${
                  paymentPercentage === 50 ? 'bg-black border-black' : 'border-gray-300'
                }`}
              >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className={`text-base font-semibold ${
                      paymentPercentage === 50 ? 'text-white' : 'text-black'
                    }`}>
                      Pay 50% Now
                    </Text>
                    <Text className={`text-sm ${
                      paymentPercentage === 50 ? 'text-white opacity-80' : 'text-black opacity-70'
                    }`}>
                      Pay remaining at salon
                    </Text>
                  </View>
                  <Text className={`text-lg font-bold ${
                    paymentPercentage === 50 ? 'text-white' : 'text-black'
                  }`}>
                    ${(price / 2).toFixed(2)}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Notes */}
          <Card style={{ marginBottom: 24 }}>
            <Text style={{ color: textColor }} className="text-xl font-bold mb-4">
              Additional Notes (Optional)
            </Text>
            <Input
              value={notes}
              onChangeText={setNotes}
              placeholder="Any special requests or notes..."
              multiline
              numberOfLines={3}
            />
          </Card>

          {/* Booking Summary */}
          <Card style={{ marginBottom: 24 }}>
            <Text style={{ color: textColor }} className="text-xl font-bold mb-4">
              Booking Summary
            </Text>
            
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text style={{ color: textColor }} className="text-base">Date:</Text>
                <Text style={{ color: textColor }} className="text-base font-semibold">
                  {selectedDate ? new Date(selectedDate).toLocaleDateString() : 'Not selected'}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text style={{ color: textColor }} className="text-base">Time:</Text>
                <Text style={{ color: textColor }} className="text-base font-semibold">
                  {selectedSlot ? `${selectedSlot.startTime} - ${selectedSlot.endTime}` : 'Not selected'}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text style={{ color: textColor }} className="text-base">Total Price:</Text>
                <Text style={{ color: textColor }} className="text-base font-semibold">
                  ${price.toFixed(2)}
                </Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text style={{ color: textColor }} className="text-base">Amount to Pay:</Text>
                <Text style={{ color: textColor }} className="text-lg font-bold">
                  ${paymentAmount.toFixed(2)}
                </Text>
              </View>
            </View>
          </Card>

          {/* Payment Flow Note */}
          <Card style={{ marginBottom: 16 }}>
            <Text style={{ color: textColor }} className="text-sm opacity-70 text-center">
              💳 {paymentPercentage === 100 
                ? 'Complete payment to create and confirm your booking.'
                : `Pay ${paymentPercentage}% now to reserve your slot. Pay remaining at salon.`
              }
            </Text>
          </Card>

          {/* Book Button or Payment Button */}
          {loading ? (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: textColor }} className="text-lg font-semibold mb-4 text-center">
                Creating your booking...
              </Text>
              <Loading />
            </View>
          ) : showPayment ? (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: textColor }} className="text-lg font-semibold mb-4 text-center">
                Complete Payment to Confirm Booking
              </Text>
              <BookingPaymentButton
                amount={paymentAmount}
                paymentPercentage={paymentPercentage}
                bookingData={{
                  storeId: params.storeId!,
                  storeServiceId: params.serviceId!,
                  bookingDate: selectedDate,
                  startTime: selectedSlot!.startTime,
                  notes: notes.trim() || undefined,
                }}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            </View>
          ) : (
            <Button
              title={`Pay $${paymentAmount.toFixed(2)}`}
              onPress={handleBooking}
              disabled={!selectedDate || !selectedSlot}
              size="large"
              style={{ marginBottom: 24 }}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}