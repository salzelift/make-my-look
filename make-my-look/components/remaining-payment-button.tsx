import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Button } from '@/components/ui/Button';
import { CreditCard } from 'lucide-react-native';
import { paymentsAPI } from '@/services/api';
import RazorpayWebView from './razorpay-webview';
import { useAuth } from '@/context/AuthContext';
import { Booking } from '@/types';

interface RemainingPaymentButtonProps {
  booking: Booking;
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: string) => void;
  disabled?: boolean;
}

export default function RemainingPaymentButton({
  booking,
  onPaymentSuccess,
  onPaymentError,
  disabled = false,
}: RemainingPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [orderId, setOrderId] = useState('');
  const { user } = useAuth();

  // Calculate remaining amount
  const remainingAmount = booking.totalPrice - booking.paidAmount;

  // Only show button if there's a remaining amount to pay
  if (remainingAmount <= 0) {
    return null;
  }

  const handlePayment = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    try {
      // Create Razorpay order for remaining amount
      const orderResponse = await paymentsAPI.createOrder({
        amount: remainingAmount,
        currency: 'INR',
        bookingId: booking.id
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
      // Verify payment
      await paymentsAPI.verifyPayment({
        orderId: orderId,
        paymentId: paymentId,
        signature: signature,
        bookingId: booking.id
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
        title={`Pay Remaining $${remainingAmount.toFixed(2)}`}
        variant="primary"
        size="small"
        disabled={disabled || isLoading}
        loading={isLoading}
        icon={<CreditCard size={16} color="white" />}
        iconPosition="right"
      />
      
      <RazorpayWebView
        visible={showRazorpay}
        onClose={() => setShowRazorpay(false)}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
        orderId={orderId}
        amount={remainingAmount}
        currency="INR"
        customerName={user?.name || ''}
        customerEmail={user?.email || ''}
        customerPhone={user?.phoneNumber || ''}
        description={`Remaining payment for booking - $${remainingAmount.toFixed(2)}`}
      />
    </>
  );
} 