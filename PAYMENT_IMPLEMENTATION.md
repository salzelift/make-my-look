# Payment Implementation Guide

## Overview
This document describes the payment functionality implemented for the salon booking system.

## Features Implemented

### 1. Backend Payment Routes
- **POST** `/api/payments/booking/:bookingId` - Process payment for a booking
- **GET** `/api/payments/booking/:bookingId/status` - Get payment status for a booking

### 2. Frontend Payment Components
- `BookingPaymentButton` - Reusable payment button component
- Integrated payment flow in booking creation

### 3. Payment Flow

#### Full Payment (100%)
1. User creates booking with 100% payment
2. Booking is created with `PENDING` status
3. Payment button is displayed
4. User completes payment
5. Booking status changes to `CONFIRMED`
6. Payment status changes to `FULL`

#### Partial Payment (50%)
1. User creates booking with 50% payment
2. Booking is created with `PENDING` status
3. Payment status is set to `PARTIAL`
4. User pays remaining amount at salon

### 4. Payment Methods Supported
- `CARD` - Credit/Debit card payment
- `CASH` - Cash payment
- `ONLINE` - Online payment gateway

## API Endpoints

### Process Payment
```http
POST /api/payments/booking/:bookingId
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentMethod": "CARD",
  "paymentAmount": 50.00
}
```

### Get Payment Status
```http
GET /api/payments/booking/:bookingId/status
Authorization: Bearer <token>
```

## Database Schema

### Booking Model
```prisma
model Booking {
  id              String        @id @default(uuid())
  customerId      String
  storeId         String
  storeServiceId  String
  bookingDate     DateTime
  startTime       String
  endTime         String
  totalPrice      Float
  paidAmount      Float         @default(0)
  paymentStatus   PaymentStatus @default(PENDING)
  status          BookingStatus @default(PENDING)
  notes           String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

enum PaymentStatus {
  PENDING
  PARTIAL
  FULL
  REFUNDED
}

enum BookingStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
}
```

## Error Handling

### Validation Errors
- Missing booking ID
- Invalid payment method
- Payment amount <= 0
- Payment amount exceeds remaining balance

### Business Logic Errors
- Booking not found
- Customer not found
- Cannot process payment for cancelled booking

## Security Features
- Authentication required for all payment endpoints
- Customer can only access their own bookings
- Payment amount validation
- Payment method validation

## Future Enhancements
1. **Real Payment Gateway Integration**
   - Stripe
   - PayPal
   - Razorpay

2. **Payment History**
   - Track all payment transactions
   - Payment receipts
   - Refund processing

3. **Advanced Features**
   - Payment scheduling
   - Installment payments
   - Loyalty program integration

## Testing
Use the provided test script to verify payment functionality:
```bash
node test-payment.js
```

## Usage Example

### Frontend
```typescript
import BookingPaymentButton from '@/components/booking-payment-button';

<BookingPaymentButton
  bookingId="booking-123"
  amount={50.00}
  onPaymentSuccess={() => console.log('Payment successful')}
  onPaymentError={(error) => console.error('Payment failed:', error)}
/>
```

### Backend
```javascript
// Process payment
const payment = await paymentsAPI.processPayment(bookingId, {
  paymentMethod: 'CARD',
  paymentAmount: 50.00
});

// Check payment status
const status = await paymentsAPI.getPaymentStatus(bookingId);
``` 