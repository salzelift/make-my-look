# 💼 Salon Admin Panel | Make My Look

A comprehensive admin panel for managing the Make My Look salon booking platform. Built with Next.js 15, TypeScript, and Tailwind CSS, featuring a premium black and white design that matches the main application.

## 🌟 Features

### 🔐 Authentication
- **Secure Admin Login** - JWT-based authentication with persistent sessions
- **Role-based Access** - Admin-only access control
- **Session Management** - Automatic token refresh and logout handling

### 📊 Dashboard Overview
- **Key Metrics** - Total users, stores, bookings, and revenue
- **Growth Indicators** - Percentage changes with trend visualization
- **Recent Activity** - Real-time platform activity feed
- **Quick Stats** - Customer satisfaction, today's bookings, and revenue

### 👥 User Management
- **Comprehensive User List** - View all users (owners, customers, employees)
- **Advanced Filtering** - Filter by user type and search functionality
- **User Details** - Complete user profiles with contact information
- **User Stats** - Breakdown by user type with visual counters
- **CRUD Operations** - Create, view, edit, and delete users

### 🏪 Store Management
- **Store Overview** - All registered stores with owner information
- **Location Tracking** - Store addresses and contact details
- **Service Monitoring** - Number of services offered per store
- **Owner Relations** - Direct link to store owners
- **Performance Metrics** - Store statistics and analytics

### 📅 Booking Management
- **Booking Overview** - All bookings with detailed information
- **Status Management** - Update booking status (pending, confirmed, completed, cancelled)
- **Payment Tracking** - Monitor payment status (pending, partial, full, refunded)
- **Advanced Filtering** - Filter by status, date, and search criteria
- **Booking Statistics** - Visual breakdown of booking statuses

### ✂️ Service Management
- **Service Types** - Manage all available service categories
- **Category Organization** - Hair, Facial, Nails, Body, Beauty services
- **Service Creation** - Add new service types with descriptions
- **Usage Tracking** - See which stores use each service
- **Category Statistics** - Visual breakdown by service category

### 📈 Analytics & Reporting
- **Revenue Analytics** - Monthly revenue trends and growth
- **Booking Trends** - Service category performance analysis
- **Top Performers** - Best performing stores and popular services
- **Customer Insights** - Retention rate, lifetime value, and behavior
- **Financial Health** - Commission tracking and payment success rates
- **Export Functionality** - Download reports for external analysis

### 🎨 Design System
- **Premium Black & White Theme** - Consistent with main application
- **Responsive Design** - Works perfectly on all screen sizes
- **Modern UI Components** - Clean cards, tables, and form elements
- **Interactive Elements** - Hover states and smooth transitions
- **Accessibility** - Proper contrast ratios and keyboard navigation

## 🚀 Getting Started

### Prerequisites
- Node.js 16 or higher
- npm or yarn
- Access to the backend API

### Installation

1. **Navigate to admin directory**
   ```bash
   cd admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env.local file
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the admin panel**
   ```
   http://localhost:3001/login
   ```

### Demo Credentials
```
Email: admin@makemylook.com
Password: admin123
```

## 📁 Project Structure

```
admin/
├── app/                          # Next.js 15 App Router
│   ├── dashboard/               # Main admin area
│   │   ├── analytics/          # Analytics and reporting
│   │   ├── bookings/           # Booking management
│   │   ├── services/           # Service type management
│   │   ├── stores/             # Store management
│   │   ├── users/              # User management
│   │   ├── layout.tsx          # Dashboard layout with sidebar
│   │   └── page.tsx            # Dashboard overview
│   ├── login/                  # Authentication
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout with providers
│   └── page.tsx                # Home redirect
├── components/                  # Reusable components
│   └── Layout/                 # Layout components
│       ├── Header.tsx          # Top navigation bar
│       └── Sidebar.tsx         # Navigation sidebar
├── contexts/                   # React contexts
│   └── AuthContext.tsx         # Authentication state management
├── lib/                        # Utilities and API
│   ├── api.ts                  # API service layer
│   └── types.ts                # TypeScript definitions
├── public/                     # Static assets
├── README.md                   # This file
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies and scripts
├── tailwind.config.js          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
```

## 🔧 Configuration

### API Integration
The admin panel connects to the backend API through a service layer:

```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
```

### Authentication Flow
1. Admin enters credentials on login page
2. API validates credentials and returns JWT token
3. Token is stored in localStorage for persistence
4. All subsequent API calls include Authorization header
5. Automatic logout on token expiration

### Data Management
- **Real-time Updates** - Data refreshes automatically
- **Optimistic Updates** - UI updates immediately for better UX
- **Error Handling** - Graceful error messages and fallbacks
- **Loading States** - Proper loading indicators throughout

## 🎯 Key Admin Actions

### User Management
- **View User Details** - Complete profile information
- **Edit User Information** - Update name, email, phone
- **Deactivate Users** - Temporarily disable accounts
- **Delete Users** - Permanently remove accounts (with confirmation)

### Store Management
- **Approve New Stores** - Review and approve store registrations
- **Edit Store Information** - Update details and contact information
- **Monitor Store Performance** - Track bookings and revenue
- **Manage Store Services** - Add/remove services from stores

### Booking Oversight
- **Status Updates** - Change booking statuses as needed
- **Payment Monitoring** - Track payment completion
- **Customer Support** - Handle booking-related issues
- **Refund Processing** - Process refunds when necessary

### Service Administration
- **Add New Services** - Introduce new service types
- **Update Descriptions** - Modify service information
- **Category Management** - Organize services by category
- **Usage Analytics** - Track service popularity

### Platform Analytics
- **Revenue Tracking** - Monitor platform earnings
- **Growth Analysis** - Track user and booking growth
- **Performance Metrics** - Identify top performers
- **Trend Analysis** - Spot patterns and opportunities

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Code Standards
- **TypeScript** - Full type safety throughout
- **ESLint** - Code quality and consistency
- **Tailwind CSS** - Utility-first styling
- **Component Architecture** - Reusable, modular components

### Adding New Features
1. Create component in appropriate directory
2. Add TypeScript types in `lib/types.ts`
3. Implement API calls in `lib/api.ts`
4. Add routing in app directory
5. Update navigation in sidebar

## 🔒 Security

### Authentication
- JWT token-based authentication
- Automatic token expiration handling
- Secure storage in localStorage
- CSRF protection through API design

### Authorization
- Admin-only access to all features
- Role-based route protection
- API endpoint validation
- Input sanitization and validation

### Data Protection
- Sensitive data masking where appropriate
- Secure API communication
- No sensitive data in client-side code
- Proper error handling without data leakage

## 📱 Responsive Design

### Mobile Support
- **Touch-friendly Interface** - Large tap targets
- **Mobile Navigation** - Collapsible sidebar
- **Responsive Tables** - Horizontal scrolling for large tables
- **Optimized Forms** - Mobile-friendly form controls

### Desktop Experience
- **Multi-column Layouts** - Efficient use of screen space
- **Keyboard Navigation** - Full keyboard accessibility
- **Desktop-specific Features** - Hover states and tooltips

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

### Hosting Options
- **Vercel** - Recommended for Next.js applications
- **Netlify** - Static site hosting with serverless functions
- **Docker** - Containerized deployment
- **Traditional Hosting** - Any Node.js hosting provider

## 🤝 Integration with Main Platform

### Backend API
The admin panel integrates seamlessly with the existing backend:
- **Shared Authentication** - Same JWT system as main app
- **Unified Database** - Same PostgreSQL database and Prisma ORM
- **Consistent API** - RESTful endpoints with standard responses

### Data Synchronization
- **Real-time Updates** - Changes reflect immediately
- **Consistent State** - Shared data models and validation
- **Cross-platform Compatibility** - Works with mobile and web apps

## 📞 Support & Maintenance

### Monitoring
- **Error Tracking** - Console logging and error boundaries
- **Performance Monitoring** - Loading times and user experience
- **Usage Analytics** - Track admin usage patterns

### Updates
- **Security Updates** - Regular dependency updates
- **Feature Enhancements** - Based on admin feedback
- **Bug Fixes** - Prompt resolution of issues

## 🎉 Status: Production Ready

The admin panel is fully functional and ready for production use:

✅ **Complete Authentication System**  
✅ **Full CRUD Operations**  
✅ **Responsive Design**  
✅ **Real-time Data Management**  
✅ **Comprehensive Analytics**  
✅ **Security Best Practices**  
✅ **Error Handling**  
✅ **TypeScript Support**  

**Built with ❤️ for salon business management**
