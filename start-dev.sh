#!/bin/bash

echo "🚀 Starting Salon Booking App Development Environment"
echo ""

# Start PostgreSQL (you'll need to have PostgreSQL installed)
echo "📦 Make sure PostgreSQL is running on localhost:5432"
echo "   Default database: salon_booking"
echo "   Default user: postgres"
echo "   Default password: password"
echo ""

# Start backend
echo "🔧 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!

echo "✅ Backend started on http://localhost:3000"
echo "🔍 Health check: http://localhost:3000/api/health"
echo ""

# Start React Native
echo "📱 Starting React Native app..."
cd ../make-my-look
npm run start &
FRONTEND_PID=$!

echo "✅ React Native started"
echo ""
echo "🎉 Development environment ready!"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "To stop both servers, run:"
echo "kill $BACKEND_PID $FRONTEND_PID"

wait