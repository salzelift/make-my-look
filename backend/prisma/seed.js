const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed service types
  const serviceTypes = [
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

  for (const service of serviceTypes) {
    await prisma.serviceType.upsert({
      where: { name: service.name },
      update: {},
      create: service
    });
  }

  console.log(`✅ Seeded ${serviceTypes.length} service types`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });