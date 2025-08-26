# Razorpay Webhook Setup Guide

## Overview
This guide explains how to set up and configure Razorpay webhooks for reliable payment status updates in the salon booking system.

## What are Webhooks?
Webhooks are HTTP callbacks that notify your application when payment events occur (payment success, failure, refund, etc.). They provide real-time updates and are essential for production applications.

## Webhook Events Handled

### 1. Payment Events
- **`payment.captured`** - Payment successfully completed
- **`payment.failed`** - Payment failed or was declined

### 2. Refund Events
- **`refund.processed`** - Refund successfully processed
- **`refund.failed`** - Refund processing failed

## Environment Variables

Add this to your `backend/.env` file:

```env
# Razorpay Webhook Configuration
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret_here"
```

## Setting Up Webhooks in Razorpay Dashboard

### 1. Access Razorpay Dashboard
1. Login to your Razorpay account
2. Go to Settings → Webhooks

### 2. Create Webhook
1. Click "Add New Webhook"
2. Configure the following:

**Webhook URL:**
```
https://your-domain.com/api/payments/webhook
```

**Events to Listen:**
- ✅ `payment.captured`
- ✅ `payment.failed`
- ✅ `refund.processed`
- ✅ `refund.failed`

**Secret Key:**
- Generate a strong secret key
- Copy it to your environment variables

### 3. Test Webhook
1. Use Razorpay's webhook testing tool
2. Send test events to verify your endpoint
3. Check logs for successful processing

## Webhook Endpoint

### URL
```
POST /api/payments/webhook
```

### Headers
```
Content-Type: application/json
x-razorpay-signature: <webhook_signature>
```

### Request Body Example
```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "id": "pay_1234567890",
      "amount": 100000,
      "currency": "INR",
      "status": "captured",
      "method": "card",
      "email": "customer@example.com",
      "contact": "+919876543210"
    },
    "order": {
      "id": "order_1234567890",
      "receipt": "booking_booking-id-123"
    }
  }
}
```

## Webhook Processing Flow

### 1. Signature Verification
```javascript
// Verify webhook signature for security
const isValid = RazorpayService.verifyWebhookSignature(
  webhookBody,
  webhookSignature,
  webhookSecret
);
```

### 2. Event Processing
```javascript
// Process different webhook events
switch (event) {
  case 'payment.captured':
    await handlePaymentCaptured(payload);
    break;
  case 'payment.failed':
    await handlePaymentFailed(payload);
    break;
  // ... other events
}
```

### 3. Booking Updates
```javascript
// Update booking status based on payment
await prisma.booking.update({
  where: { id: bookingId },
  data: {
    paidAmount: newPaidAmount,
    paymentStatus: newPaymentStatus,
    status: newBookingStatus
  }
});
```

## Security Best Practices

### 1. Signature Verification
Always verify webhook signatures to prevent unauthorized requests:
```javascript
const isValid = RazorpayService.verifyWebhookSignature(
  webhookBody,
  webhookSignature,
  webhookSecret
);
```

### 2. Environment Variables
- Never commit webhook secrets to version control
- Use different secrets for test and production
- Rotate secrets regularly

### 3. Error Handling
- Log all webhook events for debugging
- Implement retry logic for failed webhooks
- Monitor webhook delivery status

## Testing Webhooks

### 1. Local Testing
Use tools like ngrok to test webhooks locally:
```bash
# Install ngrok
npm install -g ngrok

# Expose your local server
ngrok http 3000

# Use the ngrok URL in Razorpay webhook settings
```

### 2. Test Events
Razorpay provides test events for each webhook type:
- Test payment success
- Test payment failure
- Test refund scenarios

### 3. Logging
Monitor webhook processing in your application logs:
```javascript
console.log(`Processing webhook event: ${event}`, payload);
```

## Production Deployment

### 1. HTTPS Required
- Webhooks require HTTPS in production
- Ensure your domain has valid SSL certificate
- Use secure webhook URLs

### 2. Monitoring
- Set up webhook delivery monitoring
- Monitor webhook processing times
- Alert on webhook failures

### 3. Scaling
- Handle webhook retries gracefully
- Implement idempotency for duplicate events
- Consider webhook queue processing

## Troubleshooting

### Common Issues

1. **Webhook Not Received**
   - Check webhook URL accessibility
   - Verify HTTPS configuration
   - Check firewall settings

2. **Signature Verification Failed**
   - Verify webhook secret is correct
   - Check signature calculation
   - Ensure request body is not modified

3. **Booking Not Found**
   - Verify receipt format (booking_<id>)
   - Check booking ID in database
   - Ensure booking exists

### Debug Steps

1. **Enable Detailed Logging**
   ```javascript
   console.log('Webhook received:', {
     event: req.body.event,
     payload: req.body.payload,
     signature: req.headers['x-razorpay-signature']
   });
   ```

2. **Test Webhook Endpoint**
   ```bash
   curl -X POST https://your-domain.com/api/payments/webhook \
     -H "Content-Type: application/json" \
     -H "x-razorpay-signature: test_signature" \
     -d '{"event":"test","payload":{}}'
   ```

3. **Check Razorpay Dashboard**
   - View webhook delivery status
   - Check webhook event logs
   - Verify webhook configuration

## Additional Features

### 1. Email Notifications
```javascript
// Send confirmation email on payment success
await sendPaymentConfirmationEmail(booking.customer.email, booking);
```

### 2. SMS Notifications
```javascript
// Send SMS notification to customer
await sendPaymentSMS(booking.customer.phone, booking);
```

### 3. Push Notifications
```javascript
// Send push notification to customer app
await sendPushNotification(booking.customer.userId, 'Payment successful');
```

### 4. Analytics
```javascript
// Track payment analytics
await updatePaymentAnalytics(booking.storeId, paymentAmount);
```

## Support

For webhook-related issues:
- Razorpay Webhook Documentation: https://razorpay.com/docs/webhooks/
- Razorpay Support: https://razorpay.com/support/
- Webhook Testing Tools: https://webhook.site/ 