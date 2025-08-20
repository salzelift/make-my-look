# Salon Booking Application

A premium salon booking application with separate interfaces for salon owners and customers.

## 🏗️ Architecture

### Backend (Node.js + Express + Prisma + PostgreSQL)
- **Location**: `/workspace/backend/`
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **API**: RESTful API with role-based access control

### Frontend (React Native + Expo + NativeWind)
- **Location**: `/workspace/make-my-look/`
- **Framework**: Expo with file-based routing
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Design**: Premium black/white theme for salon/beauty industry

## 🚀 Quick Start

### Prerequisites
1. **PostgreSQL** installed and running on `localhost:5432`
2. **Node.js** (v16 or higher)
3. **Expo CLI** installed globally: `npm install -g @expo/cli`

### Setup Database
```bash
# Create PostgreSQL database
createdb salon_booking

# Or using psql
psql -U postgres -c "CREATE DATABASE salon_booking;"
```

### Backend Setup
```bash
cd backend

# Install dependencies (already done)
npm install

# Set up environment variables
# Update .env file with your database credentials

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed initial data
npm run db:seed

# Start development server
npm run dev
```

### Frontend Setup
```bash
cd make-my-look

# Install dependencies (already done)
npm install

# Start Expo development server
npm start
```

### All-in-One Start
```bash
# From workspace root
./start-dev.sh
```

## 📊 Database Schema

### Core Models
- **Users**: Base user model with email, password, user type
- **Owners**: Salon owner profiles linked to users
- **Customers**: Customer profiles with preferences
- **Stores**: Salon locations with address and contact info
- **ServiceTypes**: Predefined beauty services (Hair, Nails, Facial, etc.)
- **StoreServices**: Services offered by each store with pricing
- **StoreAvailability**: Operating hours for each store
- **Bookings**: Customer appointments with payment tracking

### User Types
1. **OWNER**: Salon owners who manage stores and services
2. **CUSTOMER**: Clients who book appointments

## 🎨 Design System

### Color Palette
- **Primary**: Pure black (#000000) and white (#FFFFFF)
- **Grays**: Sophisticated gray scale for depth
- **Accents**: Minimal use of green, orange, red for status indicators

### Typography
- **Primary Font**: SpaceMono for modern, tech-forward feel
- **Hierarchy**: Clear size and weight distinctions
- **Salon Theme**: Elegant, minimal, professional

### Components
- **Button**: Primary, secondary, outline variants
- **Input**: Focused states with validation
- **Card**: Elevated containers with subtle shadows
- **Loading**: Consistent loading states

## 📱 App Flow

### Customer Journey
1. **Welcome** → Choose sign in or register
2. **Registration** → Personal info + preferred services
3. **Home** → Browse nearby salons
4. **Search** → Filter by location/services
5. **Store Details** → View services and availability
6. **Booking** → Select time slot and payment option (50% or 100%)
7. **My Bookings** → Track appointment status

### Owner Journey
1. **Welcome** → Choose sign in or register
2. **Registration** → Personal info + store details + services
3. **Dashboard** → Overview of bookings and revenue
4. **Stores** → Manage multiple salon locations
5. **Bookings** → View and manage customer appointments
6. **Profile** → Account and business settings

## 🔐 Authentication & Security

### JWT Authentication
- 7-day token expiration
- Role-based access control
- Secure password hashing with bcrypt

### API Security
- CORS enabled for cross-origin requests
- Input validation on all endpoints
- Error handling middleware

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register/owner` - Owner registration
- `POST /api/auth/register/customer` - Customer registration
- `POST /api/auth/login` - User login

### Stores
- `GET /api/stores` - Public store listing
- `GET /api/stores/:id` - Store details
- `POST /api/stores` - Create store (owner only)
- `GET /api/stores/owner/my-stores` - Owner's stores

### Bookings
- `POST /api/bookings` - Create booking (customer only)
- `GET /api/bookings/my-bookings` - Customer bookings
- `GET /api/bookings/store/:storeId` - Store bookings (owner only)
- `PATCH /api/bookings/:id/status` - Update booking status

### Services
- `GET /api/services/types` - Available service types
- `POST /api/services/seed` - Seed predefined services

## 🎯 Key Features

### For Customers
- ✅ Account registration with preferred services
- ✅ Search salons by location and services
- ✅ View salon details and available services
- ✅ Book appointments with flexible payment (50% or 100%)
- ✅ Track booking status and history
- ✅ Premium black/white UI design

### For Salon Owners
- ✅ Business account registration with store setup
- ✅ Manage multiple salon locations
- ✅ Set service pricing and duration
- ✅ Configure operating hours and availability
- ✅ View and manage customer bookings
- ✅ Dashboard with business analytics
- ✅ Accept/reject booking requests

### Advanced Features
- ✅ Real-time availability checking
- ✅ Conflict-free time slot booking
- ✅ Partial payment system (50% upfront)
- ✅ Role-based navigation and access
- ✅ Responsive design for all screen sizes

## 🛠️ Development Status

### ✅ Completed
- Database schema design
- Backend API with authentication
- Core booking system
- Premium UI components
- Authentication flow
- Basic customer and owner interfaces

### 🚧 In Progress
- Google Places API integration for addresses
- Payment processing integration
- Push notifications for booking updates
- Advanced search filters
- Store management interface

### 📋 TODO
- Add more detailed store profiles
- Implement review and rating system
- Add photo upload for services
- Create admin panel for platform management
- Add analytics and reporting features

## 🧪 Testing

### Backend Testing
```bash
cd backend

# Test health endpoint
curl http://localhost:3000/api/health

# Test service types
curl http://localhost:3000/api/services/types
```

### Frontend Testing
- Use Expo Go app on your phone
- Scan QR code from `npm start`
- Test on iOS Simulator or Android Emulator

## 🚀 Deployment

### Backend Deployment
- Deploy to Railway, Heroku, or AWS
- Set up production PostgreSQL database
- Configure environment variables
- Set up CI/CD pipeline

### Frontend Deployment
- Build with `expo build`
- Deploy to App Store and Google Play
- Set up OTA updates with Expo

## 📞 Support

For development questions or issues:
1. Check the console logs for detailed error messages
2. Verify database connection and migrations
3. Ensure all environment variables are set correctly
4. Test API endpoints individually before frontend integration