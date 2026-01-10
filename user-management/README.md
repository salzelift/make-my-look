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

## Deployment on Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Import your project on Vercel:
   - Go to https://vercel.com
   - Click "New Project"
   - Import your repository

3. Configure environment variables:
   - Add `VITE_BASE_API_URL` in the Vercel project settings
   - Set it to your backend API URL (e.g., `https://your-backend.herokuapp.com/api`)

4. Build settings (Vercel should auto-detect these):
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Deploy:
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

### Vercel Configuration

The `vercel.json` file is already configured to handle client-side routing:
- All routes are rewritten to `/index.html` so React Router can handle routing
- Static assets are served correctly before applying the rewrite

After deployment, you can reload any page (like `/forgot-password` or `/dashboard`) and it will work correctly without showing a 404 error.
