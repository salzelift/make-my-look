const express = require('express');
const { authenticateToken, requireCustomer } = require('../middleware/auth');
const prisma = require('../utils/database');

const router = express.Router();

// Get customer profile
router.get('/profile', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { userId: req.userId },
      include: {
        user: {
          select: { id: true, name: true, email: true, phoneNumber: true }
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

    if (!customer) {
      return res.status(404).json({ error: 'Customer profile not found' });
    }

    // Get preferred service types
    const preferredServices = await prisma.serviceType.findMany({
      where: {
        id: { in: customer.preferredServices }
      }
    });

    res.json({ 
      customer: {
        ...customer,
        preferredServiceTypes: preferredServices
      }
    });
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update customer profile
router.put('/profile', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { name, phoneNumber, preferredServices } = req.body;

    // Update user details
    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(name && { name }),
        ...(phoneNumber && { phoneNumber })
      }
    });

    // Update customer preferences
    let updatedCustomer = null;
    if (preferredServices !== undefined) {
      updatedCustomer = await prisma.customer.update({
        where: { userId: req.userId },
        data: { preferredServices }
      });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber
      }
    });

  } catch (error) {
    console.error('Error updating customer profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Search stores and services
router.get('/search', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { query, serviceType, latitude, longitude, radius = 10 } = req.query;

    // Get customer to check associated owner
    const customer = await prisma.customer.findUnique({
      where: { userId: req.userId },
      include: { owner: true }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer profile not found' });
    }

    let whereClause = {};

    // Only show stores from the associated owner
    if (customer.ownerId) {
      whereClause.ownerId = customer.ownerId;
    } else {
      // If no owner associated, return empty results
      return res.json({ stores: [] });
    }

    // Search by store name or address
    if (query) {
      whereClause.AND = [
        { ownerId: customer.ownerId },
        {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { address: { contains: query, mode: 'insensitive' } }
          ]
        }
      ];
      delete whereClause.ownerId; // Remove duplicate
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
        services: {
          where: { isActive: true },
          include: {
            serviceType: true
          }
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

    // If location provided, calculate distance and sort
    let storesWithDistance = stores;
    if (latitude && longitude) {
      storesWithDistance = stores
        .map(store => ({
          ...store,
          distance: store.latitude && store.longitude 
            ? calculateDistance(
                parseFloat(latitude), 
                parseFloat(longitude),
                store.latitude,
                store.longitude
              )
            : null
        }))
        .filter(store => !store.distance || store.distance <= radius)
        .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    }

    res.json({ stores: storesWithDistance });

  } catch (error) {
    console.error('Error searching stores:', error);
    res.status(500).json({ error: 'Failed to search stores' });
  }
});

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

// Change owner code
router.post('/change-owner-code', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { ownerCode } = req.body;

    if (!ownerCode) {
      return res.status(400).json({ error: 'Owner code is required' });
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

    // Update customer with new owner association
    const updatedCustomer = await prisma.customer.update({
      where: { userId: req.userId },
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
      message: 'Successfully changed owner association',
      customer: updatedCustomer,
      owner: {
        id: owner.id,
        name: owner.user.name,
        ownerCode: owner.ownerCode
      }
    });

  } catch (error) {
    console.error('Error changing owner code:', error);
    res.status(500).json({ error: 'Failed to change owner code' });
  }
});

module.exports = router;