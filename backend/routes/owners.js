const express = require('express');
const { authenticateToken, requireOwner } = require('../middleware/auth');
const prisma = require('../utils/database');

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

module.exports = router;