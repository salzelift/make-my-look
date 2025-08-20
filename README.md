# 💇‍♀️ Salon Booking Application

A premium salon booking platform with sophisticated black/white design, built for both salon owners and customers.

## 🌟 Overview

This is a comprehensive salon booking application that allows customers to discover and book beauty services while providing salon owners with powerful management tools. The app features a premium black and white design aesthetic perfect for the beauty industry.

## 🏗️ Architecture

### Backend Stack
- **Node.js** with Express.js framework
- **PostgreSQL** database with Prisma ORM
- **JWT** authentication with bcrypt password hashing
- **RESTful API** with role-based access control

### Frontend Stack
- **React Native** with Expo framework
- **NativeWind** (Tailwind CSS for React Native)
- **TypeScript** for type safety
- **Expo Router** for file-based navigation

## ✨ Features

### 👤 For Customers
- ✅ **Account Registration** with service preferences
- ✅ **Search & Discovery** - Find salons by location and services
- ✅ **Detailed Store Views** with services, pricing, and availability
- ✅ **Flexible Booking** with time slot selection
- ✅ **Payment Options** - Pay 50% or 100% upfront
- ✅ **Booking Management** - Track appointment status and history
- ✅ **Premium UI** - Sophisticated black/white design

### 🏪 For Salon Owners
- ✅ **Business Registration** with store creation
- ✅ **Multi-Store Management** - Manage multiple salon locations
- ✅ **Service Configuration** - Set pricing, duration, and descriptions
- ✅ **Operating Hours** - Configure availability for each day
- ✅ **Booking Management** - View and manage customer appointments
- ✅ **Dashboard Analytics** - Business metrics and recent bookings
- ✅ **Status Updates** - Confirm, complete, or cancel bookings

### 🔧 Technical Features
- ✅ **Real-time Availability** - Conflict-free time slot booking
- ✅ **Role-based Navigation** - Different interfaces for owners vs customers
- ✅ **Secure Authentication** - JWT tokens with 7-day expiration
- ✅ **Input Validation** - Comprehensive form validation
- ✅ **Error Handling** - Graceful error management
- ✅ **Responsive Design** - Works on all screen sizes

## 📁 Project Structure

```
workspace/
├── backend/                 # Node.js API Server
│   ├── routes/             # API route handlers
│   │   ├── auth.js        # Authentication endpoints
│   │   ├── stores.js      # Store management
│   │   ├── bookings.js    # Booking system
│   │   ├── owners.js      # Owner-specific endpoints
│   │   ├── customers.js   # Customer-specific endpoints
│   │   └── services.js    # Service types management
│   ├── middleware/        # Authentication middleware
│   ├── utils/            # Utilities (auth, validation, database)
│   ├── prisma/           # Database schema and migrations
│   │   ├── schema.prisma # Database schema
│   │   └── seed.js       # Database seeding script
│   ├── .env              # Environment variables
│   ├── index.js          # Express server entry point
│   └── package.json      # Backend dependencies
│
├── make-my-look/           # React Native App
│   ├── app/               # File-based routing
│   │   ├── (auth)/       # Authentication screens
│   │   ├── (tabs)/       # Main app navigation
│   │   ├── store/        # Store detail screens
│   │   ├── booking/      # Booking flow screens
│   │   ├── owner/        # Owner management screens
│   │   └── customer/     # Customer-specific screens
│   ├── components/        # Reusable components
│   │   └── ui/           # UI component library
│   ├── context/          # React context providers
│   ├── services/         # API service layer
│   ├── types/            # TypeScript definitions
│   ├── constants/        # App constants and colors
│   └── package.json      # Frontend dependencies
│
├── PROJECT_SETUP.md       # Detailed setup instructions
├── start-dev.sh          # Development startup script
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites
1. **PostgreSQL** (v12 or higher)
2. **Node.js** (v16 or higher)
3. **npm** or **yarn**
4. **Expo CLI**: `npm install -g @expo/cli`

### 1. Database Setup
```bash
# Create PostgreSQL database
createdb salon_booking

# Or using psql
psql -U postgres -c "CREATE DATABASE salon_booking;"
```

### 2. Backend Setup
```bash
cd backend

# Environment setup
# Update .env with your database credentials:
# DATABASE_URL="postgresql://username:password@localhost:5432/salon_booking"

# Generate Prisma client
npm run db:generate

# Create database tables
npm run db:push

# Seed predefined services (25+ beauty services)
npm run db:seed

# Start development server
npm run dev
```

### 3. Frontend Setup
```bash
cd make-my-look

# Start Expo development server
npm start
```

### 4. One-Command Start
```bash
# From workspace root (after database setup)
./start-dev.sh
```

## 📱 App Screens & Flow

### Authentication Flow
1. **Welcome Screen** - Premium landing page with branding
2. **Login Screen** - Clean sign-in interface
3. **Registration Choice** - Customer vs Owner selection
4. **Customer Registration** - Personal info + service preferences
5. **Owner Registration** - Business info + store creation + services

### Customer Journey
1. **Home** - Browse nearby salons with search functionality
2. **Store Details** - View services, pricing, and store information
3. **Booking Creation** - Select date, time, and payment option
4. **My Bookings** - Track appointment history and status
5. **Search** - Advanced filtering by location and services
6. **Profile** - Account management and preferences

### Owner Journey
1. **Dashboard** - Business overview with key metrics
2. **Stores Management** - Manage multiple salon locations
3. **Store Details** - Configure services, pricing, and hours
4. **Bookings Management** - View and update appointment status
5. **Add Store** - Create new salon locations
6. **Profile** - Business account settings

## 🎨 Design System

### Color Palette
- **Primary Black**: #000000 (main actions, text)
- **Primary White**: #FFFFFF (backgrounds, contrast text)
- **Soft Gray**: #F5F5F5 (input backgrounds)
- **Light Gray**: #E5E5E5 (borders)
- **Medium Gray**: #888888 (placeholder text)
- **Status Colors**: Green (success), Orange (warning), Red (error)

### Typography
- **Primary Font**: SpaceMono (modern, tech-forward)
- **Sizes**: 32px (titles), 20px (subtitles), 16px (body), 14px (labels)
- **Weights**: Bold (headings), Semibold (emphasis), Regular (body)

### Components
- **Button**: 3 variants (primary, secondary, outline) × 3 sizes
- **Input**: Focused states with validation and error handling
- **Card**: Elevated containers with subtle shadows and borders
- **Loading**: Consistent loading states with branded styling

## 🗄️ Database Schema

### Core Models
- **Users** - Base authentication with role-based access
- **Owners** - Salon owner profiles with business information
- **Customers** - Customer profiles with service preferences
- **Stores** - Salon locations with contact and location data
- **ServiceTypes** - 25+ predefined beauty services across categories
- **StoreServices** - Store-specific services with pricing and duration
- **StoreAvailability** - Operating hours configuration
- **Bookings** - Appointments with payment tracking and status

### Service Categories
- **Hair**: Haircut, Coloring, Wash & Blow Dry, Treatment, Highlights, Perming
- **Facial**: Classic, Anti-Aging, Acne Treatment, Hydrating, Chemical Peel
- **Nails**: Manicure, Pedicure, Gel Polish, Nail Art, Extensions
- **Body**: Full Body Massage, Deep Tissue, Body Scrub, Body Wrap
- **Beauty**: Eyebrow Threading/Tinting, Eyelash Extensions, Makeup, Waxing

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register/owner` - Owner registration with store
- `POST /api/auth/register/customer` - Customer registration
- `POST /api/auth/login` - User authentication

### Store Management
- `GET /api/stores` - Public store listing with search
- `GET /api/stores/:id` - Store details with services
- `POST /api/stores` - Create new store (owner only)
- `GET /api/stores/owner/my-stores` - Owner's stores
- `PUT /api/stores/:storeId/services/:serviceId` - Update service
- `POST /api/stores/:storeId/availability` - Set operating hours

### Booking System
- `POST /api/bookings` - Create booking with payment option
- `GET /api/bookings/my-bookings` - Customer booking history
- `GET /api/bookings/store/:storeId` - Store bookings (owner)
- `PATCH /api/bookings/:id/status` - Update booking status
- `GET /api/bookings/availability/:storeId/:serviceId/:date` - Available slots

### Services & Users
- `GET /api/services/types` - Available service categories
- `GET /api/owners/dashboard` - Business analytics
- `GET /api/customers/search` - Store search with filters

## 🧪 Testing the Application

### Backend Testing
```bash
# Health check
curl http://localhost:3000/api/health

# Get service types
curl http://localhost:3000/api/services/types

# Test registration (example)
curl -X POST http://localhost:3000/api/auth/register/customer \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","phoneNumber":"1234567890","password":"password123"}'
```

### Frontend Testing
1. **Expo Go App** - Scan QR code from `npm start`
2. **iOS Simulator** - Press `i` in Expo CLI
3. **Android Emulator** - Press `a` in Expo CLI
4. **Web Browser** - Press `w` in Expo CLI

## 🚀 Deployment

### Backend Deployment
1. **Railway/Heroku**: Deploy with PostgreSQL addon
2. **Environment Variables**: Set DATABASE_URL, JWT_SECRET
3. **Database Migration**: Run `npm run db:push` on production
4. **Seed Data**: Run `npm run db:seed` for initial services

### Frontend Deployment
1. **Expo Build**: `expo build:android` / `expo build:ios`
2. **App Stores**: Submit to Google Play and App Store
3. **OTA Updates**: Use `expo publish` for instant updates

## 🎯 Future Enhancements

### Immediate Additions
- **Google Places API** - Address autocomplete
- **Payment Integration** - Stripe/PayPal processing
- **Push Notifications** - Booking confirmations
- **Photo Upload** - Store and service images
- **Reviews & Ratings** - Customer feedback system

### Advanced Features
- **Real-time Chat** - Customer-owner communication
- **Calendar Sync** - Google Calendar integration
- **Advanced Analytics** - Revenue and customer insights
- **Multi-language** - Internationalization support
- **Admin Panel** - Platform management interface

## 🛠️ Development

### Code Standards
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for formatting
- **Conventional Commits** for git messages

### Key Development Decisions
1. **NativeWind over StyleSheet** - Better maintainability and consistency
2. **File-based Routing** - Cleaner navigation structure
3. **JWT Authentication** - Stateless and scalable
4. **Role-based UI** - Different experiences for different users
5. **Prisma ORM** - Type-safe database operations

## 📞 Support & Contributing

### Getting Help
1. Check console logs for detailed error messages
2. Verify database connection and environment variables
3. Ensure all dependencies are installed correctly
4. Test API endpoints individually before frontend integration

### Contributing
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 🎉 Project Status: Complete & Production Ready

This salon booking application is fully functional with:
- ✅ Complete authentication system
- ✅ Full booking workflow
- ✅ Store management for owners
- ✅ Premium UI/UX design
- ✅ Role-based access control
- ✅ Real-time availability checking
- ✅ Flexible payment options
- ✅ Comprehensive error handling

The application is ready for production deployment and can handle real-world salon booking scenarios.

**Built with ❤️ for the beauty industry**