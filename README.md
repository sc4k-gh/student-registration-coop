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
│       ├── api/
│       │   └── client.js          # API client (base URL, auth headers)
│       ├── context/
│       │   └── AuthContext.js     # Auth state provider
│       ├── navigation/
│       │   └── AppNavigator.js
│       ├── screens/
│       │   ├── auth/
│       │   │   ├── login_page.js
│       │   │   └── signup_page.js
│       │   ├── parent/
│       │   │   └── registration_form.js
│       │   ├── dashboard_page.js
│       │   ├── courses_page.js
│       │   ├── student_page.js
│       │   ├── teachers_page.js
│       │   ├── settings_page.js
│       │   └── landing_page.js
│       ├── styles/
│       │   └── theme.js
│       └── assets/
├── server/                        # Node.js Express API
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.js               # Express entry point
│       ├── config/
│       │   └── supabase.js        # Supabase client config
│       ├── middleware/
│       │   ├── auth.js            # JWT verification
│       │   └── roleGuard.js       # Role-based access control
│       ├── routes/
│       │   ├── auth.js
│       │   ├── programs.js
│       │   ├── locations.js
│       │   ├── timeSlots.js
│       │   ├── registrations.js
│       │   └── admin.js
│       └── controllers/
│           ├── authController.js
│           ├── programController.js
│           ├── locationController.js
│           ├── timeSlotController.js
│           ├── registrationController.js
│           └── adminController.js
├── database/
│   ├── schema.sql                 # CREATE TABLE statements
│   └── seed.sql                   # Seed data (admin account, sample data)
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
