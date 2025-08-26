const Razorpay = require('razorpay');
const crypto = require('crypto');
const prisma = require('./database');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

class RazorpayService {
  // Create a new order
  static async createOrder(amount, currency = 'INR', receipt = null) {
    try {
      const options = {
        amount: Math.round(amount * 100), // Convert to paise
        currency: currency,
        receipt: receipt || `receipt_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);
      return {
        success: true,
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt,
          status: order.status,
        },
      };
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Verify payment signature
  static verifyPaymentSignature(orderId, paymentId, signature) {
    try {
      const text = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

      const isAuthentic = expectedSignature === signature;
      
      return {
        success: isAuthentic,
        error: isAuthentic ? null : 'Invalid payment signature',
      };
    } catch (error) {
      console.error('Error verifying payment signature:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Verify webhook signature
  static verifyWebhookSignature(webhookBody, webhookSignature, webhookSecret) {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(webhookBody)
        .digest('hex');

      const isAuthentic = expectedSignature === webhookSignature;
      
      return {
        success: isAuthentic,
        error: isAuthentic ? null : 'Invalid webhook signature',
      };
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get payment details
  static async getPaymentDetails(paymentId) {
    try {
      const payment = await razorpay.payments.fetch(paymentId);
      return {
        success: true,
        payment: {
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          email: payment.email,
          contact: payment.contact,
          created_at: payment.created_at,
        },
      };
    } catch (error) {
      console.error('Error fetching payment details:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Refund payment
  static async refundPayment(paymentId, amount = null, reason = 'Customer request') {
    try {
      const refundOptions = {
        payment_id: paymentId,
        reason: reason,
      };

      if (amount) {
        refundOptions.amount = Math.round(amount * 100); // Convert to paise
      }

      const refund = await razorpay.payments.refund(refundOptions);
      
      return {
        success: true,
        refund: {
          id: refund.id,
          payment_id: refund.payment_id,
          amount: refund.amount,
          status: refund.status,
          created_at: refund.created_at,
        },
      };
    } catch (error) {
      console.error('Error refunding payment:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Process webhook event
  static async processWebhookEvent(event, paymentData) {
    try {
      console.log(`Processing webhook event: ${event}`, paymentData);

      switch (event) {
        case 'payment.captured':
          return await this.handlePaymentCaptured(paymentData);
        
        case 'payment.failed':
          return await this.handlePaymentFailed(paymentData);
        
        case 'refund.processed':
          return await this.handleRefundProcessed(paymentData);
        
        case 'refund.failed':
          return await this.handleRefundFailed(paymentData);
        
        default:
          console.log(`Unhandled webhook event: ${event}`);
          return { success: true, message: 'Event ignored' };
      }
    } catch (error) {
      console.error('Error processing webhook event:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Handle payment captured event
  static async handlePaymentCaptured(paymentData) {
    try {
      const { payment, order } = paymentData;
      
      // Extract booking ID from receipt (format: booking_<bookingId>)
      const receipt = order.receipt;
      const bookingIdMatch = receipt.match(/^booking_(.+)$/);
      
      if (!bookingIdMatch) {
        console.error(`Invalid receipt format: ${receipt}`);
        return { success: false, error: 'Invalid receipt format' };
      }
      
      const bookingId = bookingIdMatch[1];
      
      // Find booking by ID
      const booking = await prisma.booking.findFirst({
        where: {
          id: bookingId,
        },
        include: {
          storeService: true,
          customer: {
            include: {
              user: true
            }
          }
        }
      });

      if (!booking) {
        console.error(`Booking not found for order: ${order_id}`);
        return { success: false, error: 'Booking not found' };
      }

      const paymentAmount = payment.amount / 100; // Convert from paise
      const newPaidAmount = booking.paidAmount + paymentAmount;
      const newPaymentStatus = newPaidAmount >= booking.totalPrice ? 'FULL' : 'PARTIAL';

      // Update booking
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          paidAmount: newPaidAmount,
          paymentStatus: newPaymentStatus,
          status: newPaymentStatus === 'FULL' ? 'CONFIRMED' : 'PENDING'
        }
      });

      console.log(`Payment captured for booking ${booking.id}: $${paymentAmount}`);

      // Here you can add additional logic like:
      // - Send confirmation email/SMS
      // - Update inventory
      // - Send notifications to salon owner
      // - Update analytics
      // - Send push notification to customer
      // - Update booking analytics

      return {
        success: true,
        message: 'Payment captured and booking updated',
        bookingId: booking.id,
        paymentAmount: paymentAmount
      };

    } catch (error) {
      console.error('Error handling payment captured:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Handle payment failed event
  static async handlePaymentFailed(paymentData) {
    try {
      const { payment, order } = paymentData;
      
      // Extract booking ID from receipt
      const receipt = order.receipt;
      const bookingIdMatch = receipt.match(/^booking_(.+)$/);
      
      if (!bookingIdMatch) {
        console.error(`Invalid receipt format: ${receipt}`);
        return { success: false, error: 'Invalid receipt format' };
      }
      
      const bookingId = bookingIdMatch[1];
      
      // Find booking by ID
      const booking = await prisma.booking.findFirst({
        where: {
          id: bookingId,
        }
      });

      if (booking) {
        // Update booking status if needed
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            status: 'CANCELLED'
          }
        });

        console.log(`Payment failed for booking ${booking.id}`);
      }

      // Here you can add logic like:
      // - Send failure notification to customer
      // - Retry payment logic
      // - Update booking status

      return {
        success: true,
        message: 'Payment failure handled',
        bookingId: booking?.id
      };

    } catch (error) {
      console.error('Error handling payment failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Handle refund processed event
  static async handleRefundProcessed(paymentData) {
    try {
      const { refund } = paymentData;
      
      // Find booking by payment ID
      const booking = await prisma.booking.findFirst({
        where: {
          // You might need to store payment_id in booking table
          // or maintain a separate payments table
        }
      });

      if (booking) {
        const refundAmount = refund.amount / 100;
        const newPaidAmount = Math.max(0, booking.paidAmount - refundAmount);
        
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            paidAmount: newPaidAmount,
            paymentStatus: newPaidAmount >= booking.totalPrice ? 'FULL' : 'PARTIAL'
          }
        });

        console.log(`Refund processed for booking ${booking.id}: $${refundAmount}`);
      }

      return {
        success: true,
        message: 'Refund processed',
        bookingId: booking?.id
      };

    } catch (error) {
      console.error('Error handling refund processed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Handle refund failed event
  static async handleRefundFailed(paymentData) {
    try {
      const { refund } = paymentData;
      
      console.log(`Refund failed: ${refund.id}`);

      // Here you can add logic like:
      // - Retry refund
      // - Manual intervention required
      // - Notify admin

      return {
        success: true,
        message: 'Refund failure logged'
      };

    } catch (error) {
      console.error('Error handling refund failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = RazorpayService; 