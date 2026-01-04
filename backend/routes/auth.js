const express = require('express');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');
const { validateEmail, validatePhoneNumber, validatePassword } = require('../utils/validation');
const { sendOTPEmail } = require('../utils/email');
const prisma = require('../utils/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Owner Registration
router.post('/register/owner', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phoneNumber, 
      password,
      ownerCode,
      store: {
        storeName,
        storeEmail,
        storeAddress,
        storePhoneNumber,
        latitude,
        longitude,
        serviceIds
      }
    } = req.body;

    // Validation
    if (!name || !email || !phoneNumber || !password || !ownerCode) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (!storeName || !storeAddress || !serviceIds || serviceIds.length === 0) {
      return res.status(400).json({ error: 'Store details and at least one service are required' });
    }

    // Validate owner code format (alphanumeric, 6-10 characters)
    if (!/^[A-Za-z0-9]{6,10}$/.test(ownerCode)) {
      return res.status(400).json({ error: 'Owner code must be 6-10 alphanumeric characters' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Check if owner code already exists
    const existingOwnerCode = await prisma.owner.findUnique({
      where: { ownerCode }
    });

    if (existingOwnerCode) {
      return res.status(400).json({ error: 'Owner code already exists. Please choose a different code.' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user, owner, and store in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          phoneNumber,
          password: hashedPassword,
          userType: 'OWNER'
        }
      });

      // Create owner profile
      const owner = await tx.owner.create({
        data: {
          userId: user.id,
          ownerCode: ownerCode
        }
      });

      // Create store
      const store = await tx.store.create({
        data: {
          name: storeName,
          email: storeEmail,
          address: storeAddress,
          phoneNumber: storePhoneNumber || phoneNumber,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          ownerId: owner.id
        }
      });

      // Add services to store using createMany for efficiency
      if (Array.isArray(serviceIds) && serviceIds.length > 0) {
        await tx.storeService.createMany({
          data: serviceIds.map((serviceId) => ({
            storeId: store.id,
            serviceTypeId: serviceId,
            price: 0,
            duration: 60
          })),
          skipDuplicates: true
        });
      }

      return { user, owner, store };
    }, { maxWait: 10000, timeout: 15000 });

    // Generate token
    const token = generateToken(result.user.id, 'OWNER', result.user.role);

    res.status(201).json({
      message: 'Owner registered successfully',
      token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        userType: result.user.userType
      },
      store: {
        id: result.store.id,
        name: result.store.name,
        address: result.store.address
      }
    });

  } catch (error) {
    console.error('Owner registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Customer Registration
router.post('/register/customer', async (req, res) => {
  try {
    const { name, email, phoneNumber, password, preferredServices = [] } = req.body;

    // Validation
    if (!name || !email || !phoneNumber || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user and customer in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          phoneNumber,
          password: hashedPassword,
          userType: 'CUSTOMER'
        }
      });

      // Create customer profile
      const customer = await tx.customer.create({
        data: {
          userId: user.id,
          preferredServices
        }
      });

      return { user, customer };
    });

    // Generate token
    const token = generateToken(result.user.id, 'CUSTOMER', result.user.role);

    res.status(201).json({
      message: 'Customer registered successfully',
      token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        userType: result.user.userType
      }
    });

  } catch (error) {
    console.error('Customer registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        owner: {
          include: {
            stores: true
          }
        },
        customer: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Only allow CUSTOMER and OWNER to login
    if (user.userType !== 'CUSTOMER' && user.userType !== 'OWNER') {
      return res.status(403).json({ error: 'Access denied. Only customers and owners can login here.' });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id, user.userType, user.role);

    // Return only necessary user fields
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        userType: user.userType,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Customer enter owner code
router.post('/customer/enter-owner-code', async (req, res) => {
  try {
    const { ownerCode, customerId } = req.body;

    if (!ownerCode || !customerId) {
      return res.status(400).json({ error: 'Owner code and customer ID are required' });
    }

    // Find owner by code
    const owner = await prisma.owner.findUnique({
      where: { ownerCode },
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    if (!owner) {
      return res.status(404).json({ error: 'Invalid owner code' });
    }

    // Update customer with owner association
    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: { ownerId: owner.id },
      include: {
        user: {
          select: { name: true, email: true }
        },
        owner: {
          include: {
            user: {
              select: { name: true }
            }
          }
        }
      }
    });

    res.json({
      message: 'Successfully associated with owner',
      customer: updatedCustomer,
      owner: {
        id: owner.id,
        name: owner.user.name,
        ownerCode: owner.ownerCode
      }
    });

  } catch (error) {
    console.error('Error associating customer with owner:', error);
    res.status(500).json({ error: 'Failed to associate with owner' });
  }
});

// Forgot Password - Send OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Don't reveal if user exists or not for security
    if (!user) {
      return res.json({ message: 'If the email exists, an OTP has been sent.' });
    }

    // Only allow CUSTOMER and OWNER
    if (user.userType !== 'CUSTOMER' && user.userType !== 'OWNER') {
      return res.json({ message: 'If the email exists, an OTP has been sent.' });
    }

    // Check for recent OTP requests (rate limiting - max 1 per 2 minutes)
    const recentOTP = await prisma.passwordResetOTP.findFirst({
      where: {
        email,
        createdAt: {
          gte: new Date(Date.now() - 2 * 60 * 1000) // 2 minutes ago
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (recentOTP && !recentOTP.isUsed) {
      return res.status(429).json({ error: 'Please wait before requesting another OTP' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing unused OTPs for this email
    await prisma.passwordResetOTP.deleteMany({
      where: {
        email,
        isUsed: false
      }
    });

    // Create new OTP
    await prisma.passwordResetOTP.create({
      data: {
        email,
        otp,
        expiresAt
      }
    });

    // Send OTP via email
    try {
      await sendOTPEmail(email, otp);
      res.json({ message: 'If the email exists, an OTP has been sent.' });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Delete the OTP if email fails
      await prisma.passwordResetOTP.deleteMany({
        where: { email }
      });
      res.status(500).json({ error: 'Failed to send OTP email' });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ error: 'OTP must be 6 digits' });
    }

    // Find valid OTP
    const otpRecord = await prisma.passwordResetOTP.findFirst({
      where: {
        email,
        otp,
        isUsed: false,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    res.json({ message: 'OTP verified successfully' });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ error: 'OTP must be 6 digits' });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Find valid OTP
    const otpRecord = await prisma.passwordResetOTP.findFirst({
      where: {
        email,
        otp,
        isUsed: false,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Only allow CUSTOMER and OWNER
    if (user.userType !== 'CUSTOMER' && user.userType !== 'OWNER') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password and mark OTP as used
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });

      await tx.passwordResetOTP.update({
        where: { id: otpRecord.id },
        data: { isUsed: true }
      });
    });

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Delete User (self-delete)
router.delete('/user', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const userType = req.userType;

    // Only allow CUSTOMER and OWNER
    if (userType !== 'CUSTOMER' && userType !== 'OWNER') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete all unused OTPs for this user's email
    await prisma.passwordResetOTP.deleteMany({
      where: {
        email: user.email,
        isUsed: false
      }
    });

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: 'User account deleted successfully' });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user account' });
  }
});

module.exports = router;