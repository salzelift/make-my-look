# User Management App

A simple user management application built with React, TypeScript, and Vite. This app provides login, forgot password (with email OTP), and delete user functionality.

## Features

- **Login**: Authenticate users (CUSTOMER and OWNER types only)
- **Forgot Password**: Email-based OTP password reset flow
- **Delete User**: Self-service account deletion

## Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
VITE_BASE_API_URL=http://localhost:3000/api
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port Vite assigns).

## Environment Variables

- `VITE_BASE_API_URL`: The base URL for the backend API (default: `http://localhost:3000/api`)

## Backend Requirements

The backend must have the following endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/reset-password` - Reset password with OTP
- `DELETE /api/auth/user` - Delete user account (requires authentication)

## Design

The app uses a simple black and white theme with:
- White background (#ffffff)
- Black text and borders (#000000)
- Minimal, clean interface

## Routes

- `/login` - Login page
- `/forgot-password` - Forgot password flow (email → OTP → reset)
- `/dashboard` - User dashboard (protected route)
- `/` - Redirects to `/login`

## Build

To build for production:

```bash
npm run build
```

The built files will be in the `dist` directory.
