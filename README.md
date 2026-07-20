# Student Registration App

A mobile application for managing student registrations at a tutoring academy, built with React Native (Expo) and Node.js.

## Project Overview

This is a POC for a tutoring academy student registration system. It supports two roles:

- **Admin** — view and manage students, teachers, programs, time slots, and approve/reject registrations
- **Parent** — register one or more children into tutoring programs with fixed time slots

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile App | React Native 0.86 (Expo SDK 57) |
| Navigation | React Navigation (native stack + drawer) |
| State Management | React Query (TanStack Query v5) |
| Backend API | Node.js (Express 4, ES modules) |
| Database | PostgreSQL (Supabase) |
| Authentication | Supabase Auth |
| Server Tests | Vitest + Supertest |
| Build & Deploy | EAS Build → App Store / Google Play |
| API Hosting | Render |

## Project Structure

```
student-registration-coop/
├── client/                        # React Native (Expo) mobile app
│   ├── index.js                   # Expo entry point, registers App
│   ├── app.json                   # Expo app config
│   ├── .env.example               # EXPO_PUBLIC_API_URL, Supabase URL + anon key
│   ├── __tests__/                 # Jest + RNTL screen tests (32 tests, 7 suites)
│   └── src/
│       ├── App.js                 # Root component, wraps providers and navigation
│       ├── api/
│       │   └── client.js          # Fetch wrapper with base URL and auth headers
│       ├── auth/
│       │   ├── AuthProvider.js    # Auth context: session, role, login/logout
│       │   └── RequireAuth.js     # Gate that redirects unauthenticated users
│       ├── lib/
│       │   └── supabase.js        # Supabase client (SecureStore-backed session)
│       ├── navigation/
│       │   └── AppNavigator.js    # Stack/drawer navigator setup and route definitions
│       ├── screens/
│       │   ├── auth/
│       │   │   ├── login_page.js  # Email + password login form
│       │   │   └── signup_page.js # Parent sign-up form
│       │   ├── parent/
│       │   │   ├── registration_form.js  # Student registration form (multi-step)
│       │   │   └── my_registrations.js   # Parent view: own registrations + status
│       │   ├── dashboard_page.js  # Admin dashboard with summary metrics
│       │   ├── courses_page.js    # Admin view: list of programs/courses
│       │   ├── student_page.js    # Admin view: students table with filters
│       │   ├── teachers_page.js   # Admin view: teachers table with course/slot info
│       │   ├── settings_page.js   # App settings and preferences
│       │   └── landing_page.js    # Welcome screen with "Get Started" CTA
│       ├── styles/
│       │   └── listStyles.js      # Shared styles for list/table screens
│       └── assets/                # App icons, splash images
├── server/                        # Node.js Express API
│   ├── package.json               # express, @supabase/supabase-js, cors, dotenv
│   ├── vitest.config.js           # Test runner config
│   ├── .env.example               # PORT, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
│   ├── tests/                     # Vitest + Supertest API tests (45 tests, 7 suites)
│   └── src/
│       ├── index.js               # Express app setup, route mounting, error handler
│       ├── config/
│       │   └── supabase.js        # Initialize and export Supabase client instance
│       ├── middleware/
│       │   ├── auth.js            # Verify Supabase JWT from Authorization header
│       │   ├── roleGuard.js       # Check user role (admin/parent) before allowing access
│       │   └── validateUuidParam.js  # Reject malformed UUID route params
│       ├── routes/
│       │   ├── auth.js            # signup, login, setup-password
│       │   ├── programs.js        # list all programs
│       │   ├── locations.js       # list all locations
│       │   ├── timeSlots.js       # list available slots filtered by program/mode/location
│       │   ├── registrations.js   # parent submits registration, views own status
│       │   ├── students.js        # create a student record
│       │   └── admin.js           # admin CRUD for students, teachers, programs, slots, registrations
│       ├── controllers/
│       │   ├── authController.js          # Signup, login, admin password setup
│       │   ├── programController.js       # Fetching/creating programs
│       │   ├── locationController.js      # Fetching locations
│       │   ├── timeSlotController.js      # Fetching/creating slots, capacity checks
│       │   ├── studentController.js       # Creating student records
│       │   ├── registrationController.js  # Submitting registration, updating current_count
│       │   └── adminController.js         # Admin views, approve/reject registrations
│       └── utils/
│           ├── asyncHandler.js    # Forwards async route errors to the error handler
│           └── validation.js      # Shared request payload validators
├── database/
│   ├── schema.sql                 # Enums + CREATE TABLE for all 7 tables
│   ├── register_with_capacity.sql # RPC: atomic capacity check + registration insert
│   ├── review_registration.sql    # RPC: admin approve/reject
│   └── seed.sql                   # Currently empty — no seed data committed
└── docs/
    └── architecture.md            # System design documentation
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/signup` | Parent sign-up |
| POST | `/auth/login` | Email + password login |
| POST | `/auth/setup-password` | Set password (authenticated) |
| GET | `/programs` | List programs |
| GET | `/locations` | List locations |
| GET | `/time-slots` | List available slots (filterable) |
| POST | `/students` | Create a student |
| POST | `/registrations` | Submit a registration |
| GET | `/registrations/my` | Parent's own registrations |
| GET | `/admin/students` | List all students |
| GET | `/admin/teachers` | List teachers |
| GET | `/admin/teachers/:id/students` | Students for a teacher |
| POST | `/admin/teachers` | Create a teacher |
| GET / POST / PATCH | `/admin/programs[/:id]` | Read, create, update programs |
| POST | `/admin/time-slots` | Create a time slot |
| GET | `/admin/registrations` | List pending registrations |
| PATCH | `/admin/registrations/:id` | Approve/reject a registration |

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

### 2. Database
In the Supabase SQL editor, run in order:
1. `database/schema.sql`
2. `database/register_with_capacity.sql`
3. `database/review_registration.sql`

`database/seed.sql` exists but is currently empty, so there is no sample data —
create the admin user and a program manually, or fill the file in.

### 3. Backend (server)
```bash
cd server
cp .env.example .env   # PORT, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (all required)
npm install
npm start              # or: npm run dev  (nodemon)
```

`PORT` has no default — the server exits at startup if it is unset.

### 4. Frontend (client)
```bash
cd client
cp .env.example .env   # EXPO_PUBLIC_API_URL + Supabase URL and anon key
npm install
npx expo start
```

Point `EXPO_PUBLIC_API_URL` at your machine's LAN IP (not `localhost`) when testing on a physical device.

## Running the App

- **Physical device**: Scan the QR code with Expo Go (Android) or Camera app (iOS)
- **Emulator**: Press `a` (Android) or `i` (iOS) in the terminal
- **Web**: Press `w` in the terminal

## Tests

Backend — Vitest + Supertest against a mocked Supabase client (45 tests, 7 suites):

```bash
cd server
npm test
```

Frontend — Jest + React Native Testing Library (32 tests, 7 suites). These cover the
exported helpers on each screen (`verifySubmission`, `getSlotInfo`, `flattenRegistrations`,
`getTeacherPrograms`, `getEnrolledProgram`), not full render trees:

```bash
cd client
npm test
```
