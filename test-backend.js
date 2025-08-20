#!/usr/bin/env node

const http = require('http');

console.log('🧪 Testing Salon Booking Backend...\n');

// Test 1: Health Check
function testHealthCheck() {
  return new Promise((resolve, reject) => {
    console.log('1️⃣ Testing health endpoint...');
    
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/health',
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          console.log('✅ Health check passed:', response.message);
          resolve(true);
        } else {
          console.log('❌ Health check failed:', res.statusCode);
          resolve(false);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Health check error:', err.message);
      resolve(false);
    });
    
    req.end();
  });
}

// Test 2: Service Types
function testServiceTypes() {
  return new Promise((resolve, reject) => {
    console.log('\n2️⃣ Testing service types endpoint...');
    
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/services/types',
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          console.log('✅ Service types loaded:', response.services?.length || 0, 'services');
          if (response.groupedServices) {
            Object.keys(response.groupedServices).forEach(category => {
              console.log(`   - ${category}: ${response.groupedServices[category].length} services`);
            });
          }
          resolve(true);
        } else {
          console.log('❌ Service types failed:', res.statusCode);
          resolve(false);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Service types error:', err.message);
      resolve(false);
    });
    
    req.end();
  });
}

// Test 3: Store Listing
function testStores() {
  return new Promise((resolve, reject) => {
    console.log('\n3️⃣ Testing stores endpoint...');
    
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/stores',
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          console.log('✅ Stores endpoint working:', response.stores?.length || 0, 'stores found');
          resolve(true);
        } else {
          console.log('❌ Stores endpoint failed:', res.statusCode);
          resolve(false);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Stores endpoint error:', err.message);
      resolve(false);
    });
    
    req.end();
  });
}

// Run all tests
async function runTests() {
  const results = [];
  
  results.push(await testHealthCheck());
  results.push(await testServiceTypes());
  results.push(await testStores());
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Backend is working correctly.');
    console.log('\n📱 You can now start the React Native app with:');
    console.log('   cd make-my-look && npm start');
  } else {
    console.log('⚠️  Some tests failed. Check the backend setup.');
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure PostgreSQL is running');
    console.log('   2. Check DATABASE_URL in backend/.env');
    console.log('   3. Run: cd backend && npm run db:push');
    console.log('   4. Run: cd backend && npm run db:seed');
  }
  
  process.exit(passed === total ? 0 : 1);
}

// Check if server is running first
console.log('🔍 Checking if backend server is running on port 3000...\n');

setTimeout(() => {
  runTests();
}, 1000);