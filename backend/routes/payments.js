const express = require('express');
const { authenticateToken, requireCustomer } = require('../middleware/auth');
const prisma = require('../utils/database');
const RazorpayService = require('../utils/razorpay');

const router = express.Router();

// Create Razorpay order
router.post('/create-order', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { amount, currency = 'INR', bookingId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Create receipt with booking ID for webhook processing
    const receipt = bookingId ? `booking_${bookingId}` : `order_${Date.now()}`;

    // Create Razorpay order
    const orderResult = await RazorpayService.createOrder(amount, currency, receipt);
    
    if (!orderResult.success) {
      return res.status(500).json({ error: orderResult.error });
    }

    res.json({
      message: 'Order created successfully',
      order: orderResult.order
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify payment and update booking
router.post('/verify-payment', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { orderId, paymentId, signature, bookingId } = req.body;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ error: 'Order ID, Payment ID, and Signature are required' });
    }

    // Verify payment signature
    const verificationResult = RazorpayService.verifyPaymentSignature(orderId, paymentId, signature);
    
    if (!verificationResult.success) {
      return res.status(400).json({ error: verificationResult.error });
    }

    // Get payment details
    const paymentResult = await RazorpayService.getPaymentDetails(paymentId);
    
    if (!paymentResult.success) {
      return res.status(500).json({ error: 'Failed to fetch payment details' });
    }

    // Update booking with payment
    if (bookingId) {
      const booking = await prisma.booking.findFirst({
        where: {
          id: bookingId,
          customer: {
            userId: req.userId
          }
        }
      });

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      const paymentAmount = paymentResult.payment.amount / 100; // Convert from paise
      const newPaidAmount = booking.paidAmount + paymentAmount;
      const newPaymentStatus = newPaidAmount >= booking.totalPrice ? 'FULL' : 'PARTIAL';

      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paidAmount: newPaidAmount,
          paymentStatus: newPaymentStatus,
          status: newPaymentStatus === 'FULL' ? 'CONFIRMED' : 'PENDING'
        }
      });
    }

    res.json({
      message: 'Payment verified successfully',
      payment: paymentResult.payment,
      bookingUpdated: !!bookingId
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Create payment for booking
router.post('/booking/:bookingId', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentMethod, paymentAmount } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: 'Booking ID is required' });
    }

    if (!paymentMethod || !paymentAmount) {
      return res.status(400).json({ error: 'Payment method and amount are required' });
    }

    if (paymentAmount <= 0) {
      return res.status(400).json({ error: 'Payment amount must be greater than 0' });
    }

    if (!['CARD', 'CASH', 'ONLINE'].includes(paymentMethod)) {
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    // Get customer
    const customer = await prisma.customer.findUnique({
      where: { userId: req.userId }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer profile not found' });
    }

    // Get booking
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        customerId: customer.id
      },
      include: {
        storeService: true,
        store: true
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Cannot process payment for cancelled booking' });
    }

    // Validate payment amount
    const remainingAmount = booking.totalPrice - booking.paidAmount;
    if (paymentAmount > remainingAmount) {
      return res.status(400).json({ error: 'Payment amount exceeds remaining balance' });
    }

    // Process payment (simulated - in real app, integrate with payment gateway)
    console.log(`Processing payment for booking ${bookingId}: $${paymentAmount} via ${paymentMethod}`);
    
    const newPaidAmount = booking.paidAmount + paymentAmount;
    const newPaymentStatus = newPaidAmount >= booking.totalPrice ? 'FULL' : 'PARTIAL';

    console.log(`Payment status: ${booking.paymentStatus} -> ${newPaymentStatus}`);
    console.log(`Paid amount: $${booking.paidAmount} -> $${newPaidAmount}`);

    // Update booking with payment
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paidAmount: newPaidAmount,
        paymentStatus: newPaymentStatus,
        status: newPaymentStatus === 'FULL' ? 'CONFIRMED' : 'PENDING'
      },
      include: {
        storeService: {
          include: {
            serviceType: true
          }
        },
        store: true,
        customer: {
          include: {
            user: {
              select: { name: true, email: true, phoneNumber: true }
            }
          }
        }
      }
    });

    res.json({
      message: 'Payment processed successfully',
      booking: updatedBooking,
      paymentDetails: {
        amount: paymentAmount,
        method: paymentMethod,
        status: 'SUCCESS'
      }
    });

  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

// Razorpay webhook endpoint
router.post('/webhook', async (req, res) => {
  try {
    const webhookBody = JSON.stringify(req.body);
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('Webhook secret not configured');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    // Verify webhook signature
    const verificationResult = RazorpayService.verifyWebhookSignature(
      webhookBody,
      webhookSignature,
      webhookSecret
    );

    if (!verificationResult.success) {
      console.error('Invalid webhook signature:', verificationResult.error);
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const { event, payload } = req.body;

    // Process webhook event
    const result = await RazorpayService.processWebhookEvent(event, payload);

    if (result.success) {
      console.log(`Webhook processed successfully: ${event}`);
      res.json({ success: true, message: 'Webhook processed' });
    } else {
      console.error(`Webhook processing failed: ${event}`, result.error);
      res.status(500).json({ error: result.error });
    }

  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Get payment status for booking
router.get('/booking/:bookingId/status', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Get customer
    const customer = await prisma.customer.findUnique({
      where: { userId: req.userId }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer profile not found' });
    }

    // Get booking
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        customerId: customer.id
      },
      select: {
        id: true,
        totalPrice: true,
        paidAmount: true,
        paymentStatus: true,
        status: true
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const remainingAmount = booking.totalPrice - booking.paidAmount;

    res.json({
      paymentStatus: booking.paymentStatus,
      totalPrice: booking.totalPrice,
      paidAmount: booking.paidAmount,
      remainingAmount: remainingAmount,
      isFullyPaid: booking.paymentStatus === 'FULL'
    });

  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ error: 'Failed to fetch payment status' });
  }
});

module.exports = router; 