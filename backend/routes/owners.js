const express = require('express');
const { authenticateToken, requireOwner } = require('../middleware/auth');
const prisma = require('../utils/database');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const router = express.Router();

// Get owner profile
router.get('/profile', authenticateToken, requireOwner, async (req, res) => {
  try {
    const owner = await prisma.owner.findUnique({
      where: { userId: req.userId },
      include: {
        user: {
          select: { id: true, name: true, email: true, phoneNumber: true }
        },
        stores: {
          include: {
            services: {
              include: {
                serviceType: true
              }
            },
            _count: {
              select: { bookings: true }
            }
          }
        }
      }
    });

    if (!owner) {
      return res.status(404).json({ error: 'Owner profile not found' });
    }

    res.json({ owner });
  } catch (error) {
    console.error('Error fetching owner profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update owner profile
router.put('/profile', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(name && { name }),
        ...(phoneNumber && { phoneNumber })
      },
      select: { id: true, name: true, email: true, phoneNumber: true }
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating owner profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get dashboard stats
router.get('/dashboard', authenticateToken, requireOwner, async (req, res) => {
  try {
    const owner = await prisma.owner.findUnique({
      where: { userId: req.userId }
    });

    if (!owner) {
      return res.status(404).json({ error: 'Owner profile not found' });
    }

    // Get stats
    const totalStores = await prisma.store.count({
      where: { ownerId: owner.id }
    });

    const totalBookings = await prisma.booking.count({
      where: {
        store: { ownerId: owner.id }
      }
    });

    const todayBookings = await prisma.booking.count({
      where: {
        store: { ownerId: owner.id },
        bookingDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }
    });

    const totalRevenue = await prisma.booking.aggregate({
      where: {
        store: { ownerId: owner.id },
        status: 'COMPLETED'
      },
      _sum: {
        paidAmount: true
      }
    });

    const recentBookings = await prisma.booking.findMany({
      where: {
        store: { ownerId: owner.id }
      },
      include: {
        customer: {
          include: {
            user: {
              select: { name: true }
            }
          }
        },
        storeService: {
          include: {
            serviceType: true
          }
        },
        store: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    res.json({
      stats: {
        totalStores,
        totalBookings,
        todayBookings,
        totalRevenue: totalRevenue._sum.paidAmount || 0
      },
      recentBookings
    });

  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Create or update bank account
router.post('/create-bank-account', authenticateToken, requireOwner, async (req, res) => {
  try {

    const { accountName, accountNumber, ifscCode, bankName, branchName, accountType, accountHolderName } = req.body;
    const owner = await prisma.owner.findUnique({
      where: { userId: req.userId },
      include: {
        bankAccount: true,
        user: true
      }
    });

    if (!owner) {
      return res.status(404).json({ error: 'Owner profile not found' });
    }

    if (!accountName || !accountNumber || !ifscCode || !bankName || !branchName || !accountType || !accountHolderName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    let bankAccount;
    
    if (owner.bankAccount) {
      // Update existing bank account
      bankAccount = await prisma.bankAccount.update({
        where: { id: owner.bankAccount.id },
        data: {
          accountName,
          accountNumber,
          ifscCode,
          accountHolderName,
          bankName,
          branchName,
          accountType
        }
      });
    } else {
      // Create new bank account
      bankAccount = await prisma.bankAccount.create({
        data: {
          accountName,
          accountNumber,
          ifscCode,
          accountHolderName,
          bankName,
          branchName,
          accountType,
          ownerId: owner.id
        }
      });
    }

    const contact = await razorpay.contacts.create({
      name: accountHolderName,
      email: owner.user.email,
      phone: owner.user.phoneNumber,
      type: 'vendor'
    });

    const fundAccount = await razorpay.fundAccount.create({
      contact_id: contact.id,
      account_type: 'bank_account',
      bank_account: {
        name: accountHolderName,
        ifsc: ifscCode,
        account_number: accountNumber,
      }
    });

    await prisma.bankAccount.update({
      where: { id: bankAccount.id },
      data: { contactId: contact.id, fundAccountId: fundAccount.id }
    });
    
    res.json({ bankAccount });
  } catch (error) {
    console.error('Error creating/updating bank account:', error);
    res.status(500).json({ error: 'Failed to create/update bank account' });
  }
});

// Get bank account
router.get('/bank-account', authenticateToken, requireOwner, async (req, res) => {
  try {
    const owner = await prisma.owner.findUnique({
      where: { userId: req.userId },
      include: {
        bankAccount: true
      }
    });

    if (!owner) {
      return res.status(404).json({ error: 'Owner profile not found' });
    }

    res.json({ bankAccount: owner.bankAccount });
  } catch (error) {
    console.error('Error fetching bank account:', error);
    res.status(500).json({ error: 'Failed to fetch bank account' });
  }
});

router.get('/payment-payouts', authenticateToken, requireOwner, async (req, res) => {
  try {
    const owner = await prisma.owner.findUnique({
      where: { userId: req.userId }
    });

    if (!owner) {
      return res.status(404).json({ error: 'Owner profile not found' });
    }

    const paymentPayouts = await prisma.payments.findMany({
      where: { paidToId: owner.id },
      include: {
        paidBy: {
          include: {
            user: {
              select: { name: true, email: true, phoneNumber: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ paymentPayouts });
  } catch (error) {
    console.error('Error fetching payment payouts:', error);
    res.status(500).json({ error: 'Failed to fetch payment payouts' });
  }
});
module.exports = router;