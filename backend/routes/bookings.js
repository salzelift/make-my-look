const express = require('express');
const { authenticateToken, requireCustomer, requireOwner } = require('../middleware/auth');
const { validateBookingDate } = require('../utils/validation');
const prisma = require('../utils/database');

const router = express.Router();

// Customer: Create booking
router.post('/', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const {
      storeId,
      storeServiceId,
      bookingDate,
      startTime,
      paymentPercentage, // 50 or 100
      notes
    } = req.body;

    if (!storeId || !storeServiceId || !bookingDate || !startTime || !paymentPercentage) {
      return res.status(400).json({ error: 'All booking details are required' });
    }

    if (![50, 100].includes(paymentPercentage)) {
      return res.status(400).json({ error: 'Payment percentage must be 50 or 100' });
    }

    if (!validateBookingDate(bookingDate)) {
      return res.status(400).json({ error: 'Booking date must be in the future' });
    }

    // Get customer
    const customer = await prisma.customer.findUnique({
      where: { userId: req.userId }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer profile not found' });
    }

    // Get store service with pricing
    const storeService = await prisma.storeService.findUnique({
      where: { id: storeServiceId },
      include: {
        store: true,
        serviceType: true
      }
    });

    if (!storeService || !storeService.isActive) {
      return res.status(404).json({ error: 'Service not found or not available' });
    }

    if (storeService.storeId !== storeId) {
      return res.status(400).json({ error: 'Service does not belong to specified store' });
    }

    // Calculate end time
    const startDateTime = new Date(`${bookingDate}T${startTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + storeService.duration * 60000);
    const endTime = endDateTime.toTimeString().substring(0, 5);

    // Check availability
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        storeId,
        bookingDate: new Date(bookingDate),
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } }
            ]
          }
        ]
      }
    });

    if (conflictingBooking) {
      return res.status(409).json({ error: 'Time slot not available' });
    }

    // Calculate payment amount
    const totalPrice = storeService.price;
    const paidAmount = (totalPrice * paymentPercentage) / 100;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        storeId,
        storeServiceId,
        bookingDate: new Date(bookingDate),
        startTime,
        endTime,
        totalPrice,
        paidAmount,
        paymentStatus: paymentPercentage === 100 ? 'FULL' : 'PARTIAL',
        status: 'PENDING',
        notes
      },
      include: {
        store: true,
        storeService: {
          include: {
            serviceType: true
          }
        },
        customer: {
          include: {
            user: {
              select: { name: true, phoneNumber: true }
            }
          }
        }
      }
    });

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Customer: Get my bookings
router.get('/my-bookings', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { userId: req.userId }
    });

    const bookings = await prisma.booking.findMany({
      where: { customerId: customer.id },
      include: {
        store: true,
        storeService: {
          include: {
            serviceType: true
          }
        }
      },
      orderBy: { bookingDate: 'desc' }
    });

    res.json({ bookings });
  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Owner: Get store bookings
router.get('/store/:storeId', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { storeId } = req.params;
    const { date, status } = req.query;

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

    let whereClause = { storeId };
    
    if (date) {
      whereClause.bookingDate = new Date(date);
    }
    
    if (status) {
      whereClause.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        customer: {
          include: {
            user: {
              select: { name: true, phoneNumber: true, email: true }
            }
          }
        },
        storeService: {
          include: {
            serviceType: true
          }
        }
      },
      orderBy: [
        { bookingDate: 'asc' },
        { startTime: 'asc' }
      ]
    });

    res.json({ bookings });
  } catch (error) {
    console.error('Error fetching store bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Owner: Update booking status
router.patch('/:bookingId/status', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!['CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Verify ownership
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        store: {
          owner: { userId: req.userId }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found or access denied' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        customer: {
          include: {
            user: {
              select: { name: true, phoneNumber: true }
            }
          }
        },
        storeService: {
          include: {
            serviceType: true
          }
        }
      }
    });

    res.json({
      message: 'Booking status updated successfully',
      booking: updatedBooking
    });

  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Get available time slots for a service on a specific date
router.get('/availability/:storeId/:serviceId/:date', async (req, res) => {
  try {
    const { storeId, serviceId, date } = req.params;

    const storeService = await prisma.storeService.findUnique({
      where: { id: serviceId },
      include: { store: { include: { availability: true } } }
    });

    if (!storeService || storeService.storeId !== storeId) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const bookingDate = new Date(date);
    const dayOfWeek = bookingDate.getDay();

    // Get store availability for this day
    const availability = storeService.store.availability.find(
      a => a.dayOfWeek === dayOfWeek && a.isActive
    );

    if (!availability) {
      return res.json({ availableSlots: [] });
    }

    // Get existing bookings for this date
    const existingBookings = await prisma.booking.findMany({
      where: {
        storeId,
        bookingDate,
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    });

    // Generate available time slots
    const slots = generateTimeSlots(
      availability.startTime,
      availability.endTime,
      storeService.duration,
      existingBookings
    );

    res.json({ availableSlots: slots });

  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

// Helper function to generate available time slots
function generateTimeSlots(startTime, endTime, serviceDuration, existingBookings) {
  const slots = [];
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  for (let time = start; time + serviceDuration <= end; time += 30) { // 30-minute intervals
    const slotStart = minutesToTime(time);
    const slotEnd = minutesToTime(time + serviceDuration);

    // Check if this slot conflicts with existing bookings
    const hasConflict = existingBookings.some(booking => {
      const bookingStart = timeToMinutes(booking.startTime);
      const bookingEnd = timeToMinutes(booking.endTime);
      
      return (time < bookingEnd && (time + serviceDuration) > bookingStart);
    });

    if (!hasConflict) {
      slots.push({
        startTime: slotStart,
        endTime: slotEnd
      });
    }
  }

  return slots;
}

function timeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

module.exports = router;