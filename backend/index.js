const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const ownerRoutes = require('./routes/owners');
const customerRoutes = require('./routes/customers');
const storeRoutes = require('./routes/stores');
const bookingRoutes = require('./routes/bookings');
const serviceRoutes = require('./routes/services');
const paymentRoutes = require('./routes/payments');
const employeeRoutes = require('./routes/employees');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// logger middlewar

app.use((req, res, next)=>{
  console.log(`${req.method} ${req.url}`);
  next();
})

// cron job for payout
require('./utils/payout-cron');

// cron job for OTP cleanup
const cron = require('node-cron');
const { cleanupExpiredOTPs } = require('./utils/otp-cleanup');

// Cleanup expired OTPs every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log('Cron started: Cleaning up expired OTPs...');
  try {
    await cleanupExpiredOTPs();
    console.log('Cron completed: OTP cleanup finished.');
  } catch (err) {
    console.error('Error in OTP cleanup cron:', err);
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/owners', ownerRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Salon Booking API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});