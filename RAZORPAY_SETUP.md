# Razorpay Integration Setup Guide

## Overview
This guide explains how to set up Razorpay payment integration for the salon booking system.

## Prerequisites
1. Razorpay account (sign up at https://razorpay.com)
2. Test API keys for development
3. Live API keys for production

## Environment Variables

### Backend (.env)
Add these variables to your `backend/.env` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID="rzp_test_your_key_id_here"
RAZORPAY_KEY_SECRET="your_razorpay_secret_key_here"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret_here"
```

### Frontend (app.config.js or .env)
Add this variable to your frontend environment:

```env
EXPO_PUBLIC_RAZORPAY_KEY_ID="rzp_test_your_key_id_here"
```

## Getting Razorpay API Keys

### 1. Create Razorpay Account
1. Go to https://razorpay.com
2. Sign up for a new account
3. Complete KYC verification

### 2. Get Test Keys
1. Login to Razorpay Dashboard
2. Go to Settings → API Keys
3. Generate a new key pair
4. Copy the Key ID and Key Secret

### 3. Get Live Keys (for production)
1. Complete business verification
2. Generate live API keys
3. Replace test keys with live keys

## Payment Flow

### 1. Create Order
```javascript
// Frontend
const orderResponse = await paymentsAPI.createOrder({
  amount: 1000, // Amount in INR
  currency: 'INR',
  bookingId: 'booking-123'
});
```

### 2. Open Payment Modal
```javascript
// WebView opens with Razorpay checkout
<RazorpayWebView
  orderId={orderResponse.order.id}
  amount={1000}
  currency="INR"
  // ... other props
/>
```

### 3. Verify Payment
```javascript
// Backend verifies payment signature
const verification = await RazorpayService.verifyPaymentSignature(
  orderId,
  paymentId,
  signature
);
```

## Testing

### Test Cards
Use these test card numbers for testing:

- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **Expired**: 4000 0000 0000 0069

### Test UPI
- **Success**: success@razorpay
- **Failure**: failure@razorpay

## Security Best Practices

### 1. Server-Side Verification
Always verify payment signatures on the server:
```javascript
const isValid = RazorpayService.verifyPaymentSignature(
  orderId,
  paymentId,
  signature
);
```

### 2. Environment Variables
Never commit API keys to version control:
- Use `.env` files for local development
- Use environment variables in production
- Add `.env` to `.gitignore`

### 3. Webhook Verification
Set up webhooks for payment status updates:
```javascript
// Verify webhook signature
const isValidWebhook = RazorpayService.verifyWebhookSignature(
  webhookBody,
  webhookSignature,
  webhookSecret
);
```

## Error Handling

### Common Errors
1. **Invalid API Key**: Check your key configuration
2. **Amount Mismatch**: Ensure amount matches order
3. **Signature Verification Failed**: Check signature calculation
4. **Order Not Found**: Verify order ID

### Error Response Format
```javascript
{
  error: "Error description",
  code: "ERROR_CODE"
}
```

## Production Checklist

- [ ] Replace test keys with live keys
- [ ] Set up webhooks for payment notifications (see WEBHOOK_SETUP.md)
- [ ] Configure proper error handling
- [ ] Test with real payment methods
- [ ] Set up monitoring and logging
- [ ] Implement proper security measures
- [ ] Configure webhook signature verification
- [ ] Set up webhook retry logic
- [ ] Monitor webhook delivery status

## Support

For Razorpay support:
- Documentation: https://razorpay.com/docs/
- Support: https://razorpay.com/support/
- Community: https://razorpay.com/community/ 