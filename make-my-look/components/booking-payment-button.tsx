import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Button } from '@/components/ui/Button';
import { CreditCard } from 'lucide-react-native';
import { paymentsAPI, bookingsAPI } from '@/services/api';
import RazorpayWebView from './razorpay-webview';
import { useAuth } from '@/context/AuthContext';

interface BookingPaymentButtonProps {
  bookingId?: string;
  amount: number;
  paymentPercentage: 50 | 100;
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: string) => void;
  disabled?: boolean;
  bookingData?: {
    storeId: string;
    storeServiceId: string;
    bookingDate: string;
    startTime: string;
    notes?: string;
  };
}

export default function BookingPaymentButton({
  bookingId,
  amount,
  paymentPercentage,
  onPaymentSuccess,
  onPaymentError,
  disabled = false,
  bookingData
}: BookingPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [orderId, setOrderId] = useState('');
  const { user } = useAuth();

  const handlePayment = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    try {
      // Create Razorpay order
      const orderResponse = await paymentsAPI.createOrder({
        amount: amount,
        currency: 'INR',
        bookingId: bookingId
      });

      setOrderId(orderResponse.order.id);
      setShowRazorpay(true);
    } catch (error: any) {
      console.error('Error creating order:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create payment order';
      Alert.alert('Payment Error', errorMessage);
      onPaymentError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentId: string, signature: string) => {
    try {
      let finalBookingId = bookingId;

      // If no bookingId is provided, create the booking first
      if (!bookingId && bookingData) {
        try {
          const bookingResponse = await bookingsAPI.createBooking({
            storeId: bookingData.storeId,
            storeServiceId: bookingData.storeServiceId,
            bookingDate: bookingData.bookingDate,
            startTime: bookingData.startTime,
            paymentPercentage: paymentPercentage, // Use the actual payment percentage
            notes: bookingData.notes,
          });
          finalBookingId = bookingResponse.booking.id;
        } catch (error: any) {
          console.error('Error creating booking:', error);
          Alert.alert('Booking Failed', error.response?.data?.error || 'Failed to create booking');
          setShowRazorpay(false);
          return;
        }
      }

      // Verify payment
      await paymentsAPI.verifyPayment({
        orderId: orderId,
        paymentId: paymentId,
        signature: signature,
        bookingId: finalBookingId
      });

      setShowRazorpay(false);
      onPaymentSuccess?.();
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      const errorMessage = error.response?.data?.error || 'Payment verification failed';
      Alert.alert('Payment Error', errorMessage);
      onPaymentError?.(errorMessage);
      setShowRazorpay(false);
    }
  };

  const handlePaymentError = (error: string) => {
    setShowRazorpay(false);
    onPaymentError?.(error);
  };

  return (
    <>
      <Button
        onPress={handlePayment}
        title={`Pay $${amount.toFixed(2)}`}
        variant="primary"
        size="large"
        disabled={disabled || isLoading}
        loading={isLoading}
        icon={<CreditCard size={20} color="white" />}
        iconPosition="right"
      />
      
      <RazorpayWebView
        visible={showRazorpay}
        onClose={() => setShowRazorpay(false)}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
        orderId={orderId}
        amount={amount}
        currency="INR"
        customerName={user?.name || ''}
        customerEmail={user?.email || ''}
        customerPhone={user?.phoneNumber || ''}
        description={`Payment for booking - $${amount.toFixed(2)}`}
      />
    </>
  );
} 