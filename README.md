# Student Registration App

A mobile application for managing student registrations at a tutoring academy, built with React Native (Expo) and Node.js.

## Project Overview

This is a POC for a tutoring academy student registration system. It supports two roles:

- **Admin** — view and manage students, teachers, programs, time slots, and approve/reject registrations
- **Parent** — register one or more children into tutoring programs with fixed time slots

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native (Expo) |
| State Management | React Query |
| Backend API | Node.js (Express) |
| Database | PostgreSQL (Supabase) |
| Authentication | Supabase Auth |
| Build & Deploy | EAS Build → App Store / Google Play |
| API Hosting | Render |

## Project Structure

```
student-registration-coop/
├── client/                        # React Native (Expo) mobile app
│   └── src/
│       ├── App.js                 # Root component, wraps providers and navigation
│       ├── api/
│       │   └── client.js          # Axios/fetch instance with base URL and auth headers
│       ├── context/
│       │   └── AuthContext.js     # React context for auth state (user, token, login/logout)
│       ├── navigation/
│       │   └── AppNavigator.js    # Stack/drawer navigator setup and route definitions
│       ├── screens/
│       │   ├── auth/
│       │   │   ├── login_page.js  # Email + password login form
│       │   │   └── signup_page.js # Parent sign-up form
│       │   ├── parent/
│       │   │   └── registration_form.js  # Student registration form (multi-step with calendar)
│       │   ├── dashboard_page.js  # Admin dashboard with summary metrics
│       │   ├── courses_page.js    # Admin view: list of programs/courses
│       │   ├── student_page.js    # Admin view: students table with filters
│       │   ├── teachers_page.js   # Admin view: teachers table with course/slot info
│       │   ├── settings_page.js   # App settings and preferences
│       │   └── landing_page.js    # Welcome screen with "Get Started" CTA
│       ├── styles/
│       │   └── theme.js           # Shared colors, fonts, spacing constants
│       └── assets/                # App icons, splash images
├── server/                        # Node.js Express API
│   ├── package.json               # Server dependencies (express, supabase-js, cors, etc.)
│   ├── .env.example               # Template for env vars (SUPABASE_URL, SUPABASE_KEY, PORT)
│   └── src/
│       ├── index.js               # Express app setup, middleware registration, route mounting
│       ├── config/
│       │   └── supabase.js        # Initialize and export Supabase client instance
│       ├── middleware/
│       │   ├── auth.js            # Verify Supabase JWT from Authorization header
│       │   └── roleGuard.js       # Check user role (admin/parent) before allowing access
│       ├── routes/
│       │   ├── auth.js            # Routes: signup, login, setup-password
│       │   ├── programs.js        # Routes: list all programs
│       │   ├── locations.js       # Routes: list all locations
│       │   ├── timeSlots.js       # Routes: list available slots filtered by program/mode/location
│       │   ├── registrations.js   # Routes: parent submits registration, views own status
│       │   └── admin.js           # Routes: admin CRUD for students, teachers, registrations, programs
│       └── controllers/
│           ├── authController.js          # Logic for signup, login, admin password setup
│           ├── programController.js       # Logic for fetching/creating programs
│           ├── locationController.js      # Logic for fetching locations
│           ├── timeSlotController.js      # Logic for fetching/creating slots, capacity checks
│           ├── registrationController.js  # Logic for submitting registration, updating current_count
│           └── adminController.js         # Logic for admin views, approve/reject registrations
├── database/
│   ├── schema.sql                 # CREATE TABLE statements for all 7 tables
│   └── seed.sql                   # Seed data (admin email, sample programs, locations)
└── docs/
    └── architecture.md            # System design documentation
```

## Prerequisites

- **Node.js** (LTS): [nodejs.org](https://nodejs.org/)
- **Expo Go** app on your device — [iOS](https://apps.apple.com/us/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **Supabase** account for database and auth

## Setup

### 1. Clone the repository
```bash
git clone https://github.com/sc4k-gh/student-registration-coop.git
cd student-registration-coop
```

### 2. Backend (server)
```bash
cd server
npm install
cp .env.example .env   # fill in your Supabase credentials
node src/index.js
```

### 3. Frontend (client)
```bash
cd client
npm install
npx expo start
```

## Running the App

- **Physical device**: Scan the QR code with Expo Go (Android) or Camera app (iOS)
- **Emulator**: Press `a` (Android) or `i` (iOS) in the terminal
