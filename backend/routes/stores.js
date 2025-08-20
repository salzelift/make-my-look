const express = require('express');
const { authenticateToken, requireOwner } = require('../middleware/auth');
const { validateTimeSlot } = require('../utils/validation');
const prisma = require('../utils/database');

const router = express.Router();

// Get all stores (public)
router.get('/', async (req, res) => {
  try {
    const { search, serviceType, latitude, longitude, radius = 10 } = req.query;
    
    let whereClause = {};
    
    // Search by name or address
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Filter by service type
    if (serviceType) {
      whereClause.services = {
        some: {
          serviceTypeId: serviceType,
          isActive: true
        }
      };
    }

    const stores = await prisma.store.findMany({
      where: whereClause,
      include: {
        owner: {
          include: {
            user: {
              select: { name: true, phoneNumber: true }
            }
          }
        },
        services: {
          where: { isActive: true },
          include: {
            serviceType: true
          }
        },
        availability: {
          where: { isActive: true }
        }
      }
    });

    res.json({ stores });
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

// Get store by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        owner: {
          include: {
            user: {
              select: { name: true, phoneNumber: true }
            }
          }
        },
        services: {
          where: { isActive: true },
          include: {
            serviceType: true
          }
        },
        availability: {
          where: { isActive: true }
        }
      }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.json({ store });
  } catch (error) {
    console.error('Error fetching store:', error);
    res.status(500).json({ error: 'Failed to fetch store' });
  }
});

// Get owner's stores
router.get('/owner/my-stores', authenticateToken, requireOwner, async (req, res) => {
  try {
    const stores = await prisma.store.findMany({
      where: { 
        owner: { userId: req.userId }
      },
      include: {
        services: {
          include: {
            serviceType: true
          }
        },
        availability: true,
        _count: {
          select: { bookings: true }
        }
      }
    });

    res.json({ stores });
  } catch (error) {
    console.error('Error fetching owner stores:', error);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

// Create new store
router.post('/', authenticateToken, requireOwner, async (req, res) => {
  try {
    const {
      name,
      email,
      address,
      phoneNumber,
      latitude,
      longitude,
      serviceIds
    } = req.body;

    if (!name || !address || !serviceIds || serviceIds.length === 0) {
      return res.status(400).json({ error: 'Store name, address, and services are required' });
    }

    // Get owner
    const owner = await prisma.owner.findUnique({
      where: { userId: req.userId }
    });

    if (!owner) {
      return res.status(404).json({ error: 'Owner profile not found' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create store
      const store = await tx.store.create({
        data: {
          name,
          email,
          address,
          phoneNumber,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          ownerId: owner.id
        }
      });

      // Add services to store
      const storeServices = await Promise.all(
        serviceIds.map(serviceId => 
          tx.storeService.create({
            data: {
              storeId: store.id,
              serviceTypeId: serviceId,
              price: 0, // Will be updated later
              duration: 60 // Default 1 hour
            }
          })
        )
      );

      return { store, storeServices };
    });

    res.status(201).json({
      message: 'Store created successfully',
      store: result.store
    });

  } catch (error) {
    console.error('Error creating store:', error);
    res.status(500).json({ error: 'Failed to create store' });
  }
});

// Update store services (pricing, duration)
router.put('/:storeId/services/:serviceId', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { storeId, serviceId } = req.params;
    const { price, duration, description, isActive } = req.body;

    // Verify ownership
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        owner: { userId: req.userId }
      }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found or access denied' });
    }

    const updatedService = await prisma.storeService.update({
      where: { id: serviceId },
      data: {
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(duration !== undefined && { duration: parseInt(duration) }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        serviceType: true
      }
    });

    res.json({
      message: 'Service updated successfully',
      service: updatedService
    });

  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// Set store availability
router.post('/:storeId/availability', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { storeId } = req.params;
    const { availability } = req.body; // Array of { dayOfWeek, startTime, endTime }

    // Verify ownership
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        owner: { userId: req.userId }
      }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found or access denied' });
    }

    // Validate availability data
    for (const slot of availability) {
      if (!validateTimeSlot(slot.startTime, slot.endTime)) {
        return res.status(400).json({ 
          error: `Invalid time slot for day ${slot.dayOfWeek}` 
        });
      }
    }

    // Delete existing availability and create new ones
    await prisma.$transaction(async (tx) => {
      await tx.storeAvailability.deleteMany({
        where: { storeId }
      });

      await tx.storeAvailability.createMany({
        data: availability.map(slot => ({
          storeId,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isActive: true
        }))
      });
    });

    res.json({ message: 'Store availability updated successfully' });

  } catch (error) {
    console.error('Error updating store availability:', error);
    res.status(500).json({ error: 'Failed to update store availability' });
  }
});

module.exports = router;