const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const prisma = require('../utils/database');

const router = express.Router();

// Apply admin middleware to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard Analytics
router.get('/dashboard', async (req, res) => {
  try {
    // Get total counts
    const [
      totalUsers,
      totalStores,
      totalBookings,
      totalRevenue,
      recentBookings,
      topStores
    ] = await Promise.all([
      // Total users by type
      prisma.user.groupBy({
        by: ['userType'],
        _count: {
          id: true
        }
      }),
      
      // Total stores
      prisma.store.count(),
      
      // Total bookings with status
      prisma.booking.groupBy({
        by: ['status'],
        _count: {
          id: true
        }
      }),
      
      // Total revenue (sum of all paid amounts)
      prisma.booking.aggregate({
        _sum: {
          paidAmount: true
        }
      }),
      
      // Recent bookings (last 10)
      prisma.booking.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          customer: {
            include: {
              user: true
            }
          },
          store: true,
          storeService: {
            include: {
              serviceType: true
            }
          }
        }
      }),
      
      // Top stores by booking count
      prisma.store.findMany({
        take: 5,
        include: {
          _count: {
            select: {
              bookings: true
            }
          },
          owner: {
            include: {
              user: true
            }
          }
        },
        orderBy: {
          bookings: {
            _count: 'desc'
          }
        }
      })
    ]);

    // Calculate monthly revenue for the last 6 months
    const monthlyRevenue = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        SUM("paidAmount") as revenue
      FROM bookings 
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
    `;

    res.json({
      analytics: {
        users: totalUsers,
        stores: totalStores,
        bookings: totalBookings,
        totalRevenue: totalRevenue._sum.paidAmount || 0,
        monthlyRevenue
      },
      recentBookings,
      topStores
    });

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get all users with pagination and filtering
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, userType, role, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};
    
    if (userType) {
      where.userType = userType;
    }
    
    if (role) {
      where.role = role;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          owner: {
            include: {
              stores: {
                include: {
                  _count: {
                    select: {
                      bookings: true
                    }
                  }
                }
              }
            }
          },
          customer: {
            include: {
              _count: {
                select: {
                  bookings: true
                }
              }
            }
          },
          employee: {
            include: {
              storeEmployees: {
                include: {
                  store: true
                }
              }
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get all stores with pagination and filtering
router.get('/stores', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          owner: {
            include: {
              user: true
            }
          },
          services: {
            include: {
              serviceType: true
            }
          },
          _count: {
            select: {
              bookings: true,
              services: true,
              storeEmployees: true
            }
          }
        }
      }),
      prisma.store.count({ where })
    ]);

    res.json({
      stores,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

// Get all bookings with pagination and filtering
router.get('/bookings', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      paymentStatus, 
      storeId,
      startDate,
      endDate,
      search 
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }
    
    if (storeId) {
      where.storeId = storeId;
    }
    
    if (startDate && endDate) {
      where.bookingDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    
    if (search) {
      where.OR = [
        {
          customer: {
            user: {
              name: { contains: search, mode: 'insensitive' }
            }
          }
        },
        {
          store: {
            name: { contains: search, mode: 'insensitive' }
          }
        }
      ];
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          customer: {
            include: {
              user: true
            }
          },
          store: {
            include: {
              owner: {
                include: {
                  user: true
                }
              }
            }
          },
          storeService: {
            include: {
              serviceType: true
            }
          },
          employee: {
            include: {
              user: true
            }
          }
        }
      }),
      prisma.booking.count({ where })
    ]);

    res.json({
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get payment history with pagination and filtering
router.get('/payments', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      paymentStatus, 
      startDate,
      endDate,
      search 
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    
    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    
    if (search) {
      where.OR = [
        {
          customer: {
            user: {
              name: { contains: search, mode: 'insensitive' }
            }
          }
        },
        {
          store: {
            name: { contains: search, mode: 'insensitive' }
          }
        }
      ];
    }

    const [payments, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          totalPrice: true,
          paidAmount: true,
          paymentStatus: true,
          bookingDate: true,
          createdAt: true,
          customer: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          },
          store: {
            include: {
              owner: {
                include: {
                  user: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          },
          storeService: {
            include: {
              serviceType: true
            }
          }
        }
      }),
      prisma.booking.count({ where })
    ]);

    // Calculate payment statistics
    const paymentStats = await prisma.booking.aggregate({
      where,
      _sum: {
        totalPrice: true,
        paidAmount: true
      },
      _count: {
        id: true
      }
    });

    res.json({
      payments,
      statistics: {
        totalBookings: paymentStats._count.id,
        totalRevenue: paymentStats._sum.totalPrice || 0,
        totalPaid: paymentStats._sum.paidAmount || 0,
        pendingAmount: (paymentStats._sum.totalPrice || 0) - (paymentStats._sum.paidAmount || 0)
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get all services
router.get('/services', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [services, total] = await Promise.all([
      prisma.serviceType.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: {
          name: 'asc'
        },
        include: {
          _count: {
            select: {
              storeServices: true
            }
          }
        }
      }),
      prisma.serviceType.count({ where })
    ]);

    res.json({
      services,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Create new service
router.post('/services', async (req, res) => {
  try {
    const { name, description, category } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }

    const service = await prisma.serviceType.create({
      data: {
        name,
        description,
        category
      }
    });

    res.status(201).json({
      message: 'Service created successfully',
      service
    });

  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// Update service
router.put('/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }

    const service = await prisma.serviceType.update({
      where: { id },
      data: {
        name,
        description,
        category
      }
    });

    res.json({
      message: 'Service updated successfully',
      service
    });

  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// Delete service
router.delete('/services/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if service is being used by any stores
    const storeServices = await prisma.storeService.findMany({
      where: { serviceTypeId: id }
    });

    if (storeServices.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete service. It is being used by stores.' 
      });
    }

    await prisma.serviceType.delete({
      where: { id }
    });

    res.json({
      message: 'Service deleted successfully'
    });

  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// Update user role (admin only)
router.patch('/users/:userId/role', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Valid role is required' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        userType: true
      }
    });

    res.json({
      message: 'User role updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

module.exports = router; 