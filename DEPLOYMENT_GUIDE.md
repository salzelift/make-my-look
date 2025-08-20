# 🚀 Salon Booking App - Deployment Guide

This guide covers deploying the salon booking application to production environments.

## 📋 Pre-Deployment Checklist

### Backend Requirements
- [ ] PostgreSQL database (v12+)
- [ ] Node.js environment (v16+)
- [ ] Environment variables configured
- [ ] Database schema migrated
- [ ] Service types seeded

### Frontend Requirements
- [ ] Expo account created
- [ ] API base URL configured for production
- [ ] App icons and splash screens ready
- [ ] App store developer accounts (iOS/Android)

## 🗄️ Database Setup

### 1. Production PostgreSQL

#### Option A: Managed Database (Recommended)
```bash
# Railway
railway login
railway new
railway add postgresql

# Heroku
heroku addons:create heroku-postgresql:mini

# AWS RDS, Google Cloud SQL, or Azure Database for PostgreSQL
# Follow provider-specific setup guides
```

#### Option B: Self-hosted
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo -u postgres createdb salon_booking
sudo -u postgres psql -c "CREATE USER salon_user WITH PASSWORD 'secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE salon_booking TO salon_user;"
```

### 2. Database Migration
```bash
cd backend

# Update DATABASE_URL in production environment
export DATABASE_URL="postgresql://user:password@host:port/salon_booking"

# Run migrations
npm run db:push

# Seed initial data
npm run db:seed
```

## 🖥️ Backend Deployment

### Option 1: Railway (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
cd backend
railway init
railway add postgresql

# Set environment variables
railway variables set JWT_SECRET="your-super-secure-jwt-secret-key"
railway variables set NODE_ENV="production"

# Deploy
git add .
git commit -m "Deploy to Railway"
railway up
```

### Option 2: Heroku
```bash
# Install Heroku CLI and login
heroku login
cd backend

# Create app
heroku create salon-booking-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set JWT_SECRET="your-super-secure-jwt-secret-key"
heroku config:set NODE_ENV="production"

# Deploy
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a salon-booking-api
git push heroku main

# Run migrations
heroku run npm run db:push
heroku run npm run db:seed
```

### Option 3: DigitalOcean App Platform
```bash
# Create app.yaml
cat > app.yaml << EOF
name: salon-booking-api
services:
- name: api
  source_dir: backend
  github:
    repo: your-username/salon-booking
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  env:
  - key: NODE_ENV
    value: "production"
  - key: JWT_SECRET
    value: "your-super-secure-jwt-secret-key"
databases:
- name: salon-db
  engine: PG
  version: "13"
EOF

# Deploy via DigitalOcean dashboard or CLI
```

### Option 4: AWS (Advanced)
```bash
# Using AWS Elastic Beanstalk
npm install -g eb

# Initialize
eb init salon-booking-api

# Create environment
eb create production

# Set environment variables
eb setenv JWT_SECRET="your-super-secure-jwt-secret-key"
eb setenv NODE_ENV="production"
eb setenv DATABASE_URL="your-rds-connection-string"

# Deploy
eb deploy
```

## 📱 Frontend Deployment

### 1. Update API Configuration
```typescript
// make-my-look/services/api.ts
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'
  : 'https://your-production-api.com/api'; // Update this
```

### 2. Build for App Stores

#### iOS Deployment
```bash
cd make-my-look

# Configure app.json for iOS
# Update version, bundle identifier, etc.

# Build for iOS
expo build:ios

# Or with EAS Build (recommended)
npm install -g @expo/eas-cli
eas login
eas build:configure
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

#### Android Deployment
```bash
# Build for Android
expo build:android

# Or with EAS Build
eas build --platform android

# Submit to Google Play
eas submit --platform android
```

### 3. Web Deployment
```bash
# Build for web
expo export:web

# Deploy to Netlify
npm install -g netlify-cli
netlify deploy --prod --dir web-build

# Or deploy to Vercel
npm install -g vercel
vercel --prod
```

## 🔧 Environment Variables

### Backend (.env)
```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Authentication
JWT_SECRET="your-super-secure-jwt-secret-key-change-in-production"

# Server
PORT=3000
NODE_ENV="production"

# Optional: Email service for notifications
SENDGRID_API_KEY="your-sendgrid-key"
FROM_EMAIL="noreply@yoursalon.com"

# Optional: File upload service
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_BUCKET_NAME="salon-booking-uploads"
```

### Frontend (app.json)
```json
{
  "expo": {
    "name": "Salon Booking",
    "slug": "salon-booking",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "salonbooking",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourdomain.salonbooking"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.yourdomain.salonbooking"
    },
    "web": {
      "favicon": "./assets/images/favicon.png"
    }
  }
}
```

## 🔒 Security Considerations

### Backend Security
```bash
# Use strong JWT secrets (32+ characters)
JWT_SECRET=$(openssl rand -base64 32)

# Enable CORS only for your domains
# In index.js:
app.use(cors({
  origin: ['https://yourdomain.com', 'https://app.yourdomain.com'],
  credentials: true
}));

# Use HTTPS in production
# Enable rate limiting
npm install express-rate-limit
```

### Database Security
```sql
-- Create restricted database user
CREATE USER salon_app WITH PASSWORD 'secure_random_password';
GRANT CONNECT ON DATABASE salon_booking TO salon_app;
GRANT USAGE ON SCHEMA public TO salon_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO salon_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO salon_app;
```

## 📊 Monitoring & Analytics

### Backend Monitoring
```bash
# Add logging middleware
npm install morgan winston

# Health check endpoint (already implemented)
GET /api/health

# Add performance monitoring
npm install newrelic # or datadog, sentry
```

### Frontend Analytics
```bash
# Add Expo Analytics
expo install expo-analytics-amplitude

# Or Google Analytics
npm install @react-native-google-analytics/google-analytics
```

## 🚀 CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy Salon Booking App

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: cd backend && npm ci
      - run: cd backend && npm test
      - name: Deploy to Railway
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: cd make-my-look && npm ci
      - name: Build and Deploy
        run: |
          cd make-my-look
          eas build --platform all --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

## 🧪 Production Testing

### Load Testing
```bash
# Install artillery
npm install -g artillery

# Create load test config
cat > load-test.yml << EOF
config:
  target: 'https://your-api.com'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Health check"
    requests:
      - get:
          url: "/api/health"
EOF

# Run load test
artillery run load-test.yml
```

### End-to-End Testing
```bash
# Using Detox for React Native
npm install -g detox-cli
cd make-my-look
detox init
detox build --configuration ios
detox test --configuration ios
```

## 📱 App Store Optimization

### iOS App Store
- App name: "Salon Booking - Beauty Services"
- Keywords: salon, beauty, booking, appointments, hair, nails
- Screenshots: Show booking flow, store discovery, premium design
- App preview: 30-second video showing key features

### Google Play Store
- App title: "Salon Booking - Premium Beauty Services"
- Short description: "Book beauty appointments at premium salons"
- Full description: Highlight key features and benefits
- Feature graphic: Professional banner showcasing the app

## 🔄 Post-Deployment

### 1. Database Backup
```bash
# Automated daily backups
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Set up automated backups with your hosting provider
```

### 2. Monitoring Setup
```bash
# Set up uptime monitoring
# Pingdom, UptimeRobot, or StatusCake

# Set up error tracking
# Sentry, Bugsnag, or Rollbar
```

### 3. Performance Optimization
```bash
# Enable gzip compression
# Set up CDN for static assets
# Optimize database queries
# Add Redis caching for frequently accessed data
```

## 🆘 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL -c "SELECT version();"

# Check firewall settings
# Verify SSL requirements
```

#### Build Failures
```bash
# Clear Expo cache
expo r -c

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### API Issues
```bash
# Check logs
heroku logs --tail
railway logs

# Test endpoints
curl -X GET https://your-api.com/api/health
```

## 📞 Support

### Documentation
- [Expo Documentation](https://docs.expo.dev/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/)

### Community
- [Expo Discord](https://chat.expo.dev/)
- [React Native Community](https://reactnative.dev/community/overview)
- [Prisma Slack](https://slack.prisma.io/)

---

## ✅ Deployment Checklist

Before going live, ensure:

- [ ] Database is properly configured and backed up
- [ ] All environment variables are set
- [ ] API endpoints are tested and working
- [ ] Frontend builds successfully for all platforms
- [ ] App store metadata is complete
- [ ] Monitoring and analytics are configured
- [ ] Security measures are in place
- [ ] Performance is optimized
- [ ] Error handling is comprehensive
- [ ] User feedback collection is set up

**Your salon booking app is ready for the world! 🎉**