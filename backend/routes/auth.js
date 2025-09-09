const express = require('express');
const { hashPassword, comparePassword, generateToken } = require('../utils/auth');
const { validateEmail, validatePhoneNumber, validatePassword } = require('../utils/validation');
const prisma = require('../utils/database');

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

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id, user.userType, user.role);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
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

module.exports = router;