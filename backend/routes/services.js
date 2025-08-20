const express = require('express');
const prisma = require('../utils/database');

const router = express.Router();

// Get all service types
router.get('/types', async (req, res) => {
  try {
    const serviceTypes = await prisma.serviceType.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    // Group by category
    const groupedServices = serviceTypes.reduce((acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = [];
      }
      acc[service.category].push(service);
      return acc;
    }, {});

    res.json({
      services: serviceTypes,
      groupedServices
    });
  } catch (error) {
    console.error('Error fetching service types:', error);
    res.status(500).json({ error: 'Failed to fetch service types' });
  }
});

// Seed predefined services (for development)
router.post('/seed', async (req, res) => {
  try {
    const predefinedServices = [
      // Hair Services
      { name: 'Haircut & Styling', category: 'Hair', description: 'Professional haircut and styling' },
      { name: 'Hair Coloring', category: 'Hair', description: 'Hair dyeing and coloring services' },
      { name: 'Hair Wash & Blow Dry', category: 'Hair', description: 'Hair washing and blow drying' },
      { name: 'Hair Treatment', category: 'Hair', description: 'Deep conditioning and hair treatments' },
      { name: 'Highlights', category: 'Hair', description: 'Hair highlighting services' },
      { name: 'Perming', category: 'Hair', description: 'Hair perming and curling' },
      
      // Facial Services
      { name: 'Classic Facial', category: 'Facial', description: 'Basic facial treatment' },
      { name: 'Anti-Aging Facial', category: 'Facial', description: 'Anti-aging facial treatment' },
      { name: 'Acne Treatment', category: 'Facial', description: 'Acne and blemish treatment' },
      { name: 'Hydrating Facial', category: 'Facial', description: 'Deep hydration facial' },
      { name: 'Chemical Peel', category: 'Facial', description: 'Chemical exfoliation treatment' },
      
      // Nail Services
      { name: 'Manicure', category: 'Nails', description: 'Hand and nail care' },
      { name: 'Pedicure', category: 'Nails', description: 'Foot and nail care' },
      { name: 'Gel Polish', category: 'Nails', description: 'Long-lasting gel nail polish' },
      { name: 'Nail Art', category: 'Nails', description: 'Creative nail designs' },
      { name: 'Nail Extensions', category: 'Nails', description: 'Acrylic or gel nail extensions' },
      
      // Body Services
      { name: 'Full Body Massage', category: 'Body', description: 'Relaxing full body massage' },
      { name: 'Deep Tissue Massage', category: 'Body', description: 'Therapeutic deep tissue massage' },
      { name: 'Body Scrub', category: 'Body', description: 'Exfoliating body treatment' },
      { name: 'Body Wrap', category: 'Body', description: 'Detoxifying body wrap' },
      
      // Beauty Services
      { name: 'Eyebrow Threading', category: 'Beauty', description: 'Precise eyebrow shaping' },
      { name: 'Eyebrow Tinting', category: 'Beauty', description: 'Eyebrow coloring service' },
      { name: 'Eyelash Extensions', category: 'Beauty', description: 'Semi-permanent eyelash extensions' },
      { name: 'Makeup Application', category: 'Beauty', description: 'Professional makeup service' },
      { name: 'Waxing', category: 'Beauty', description: 'Hair removal services' }
    ];

    const createdServices = await Promise.all(
      predefinedServices.map(service => 
        prisma.serviceType.upsert({
          where: { name: service.name },
          update: {},
          create: service
        })
      )
    );

    res.json({
      message: 'Services seeded successfully',
      count: createdServices.length,
      services: createdServices
    });

  } catch (error) {
    console.error('Error seeding services:', error);
    res.status(500).json({ error: 'Failed to seed services' });
  }
});

module.exports = router;