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
| Authentication | Supabase Auth — server validates the Supabase JWT in middleware (`supabase.auth.getUser`) and reads `role` from `app_metadata` |
| Build & Deploy | EAS Build → App Store / Google Play |
| API Hosting | Render |

## Project Structure

```
student-registration-coop/
├── client/                        # React Native (Expo) mobile app
│   └── src/
│       ├── App.js                 # Root component, wraps providers and navigation
│       ├── api/
│       │   └── client.js          # HTTP instance with base URL and auth headers
│       ├── auth/
│       │   └── AuthProvider.js    # Auth state provider (session, login/logout)
│       ├── context/
│       │   └── AuthContext.js     # React context consumed by AuthProvider
│       ├── lib/
│       │   └── supabase.js        # Client-side Supabase instance
│       ├── navigation/
│       │   └── AppNavigator.js    # Stack/drawer navigator setup and route definitions
│       ├── screens/
│       │   ├── auth/
│       │   │   ├── login_page.js  # Email + password login form
│       │   │   └── signup_page.js # Parent sign-up form
│       │   ├── parent/
│       │   │   ├── registration_form.js   # Student registration form (multi-step with calendar)
│       │   │   └── my_registrations.js    # Parent view: own registrations + status
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
│   ├── package.json               # Server dependencies and scripts
│   ├── vitest.config.js           # Test runner config
│   └── src/
│       ├── index.js               # Express app setup, CORS, route mounting, error handler
│       ├── config/
│       │   └── supabase.js        # Service-role + anon Supabase clients
│       ├── middleware/
│       │   ├── auth.js            # Verify Supabase JWT from Authorization header
│       │   └── roleGuard.js       # Check user role (admin/parent) before allowing access
│       ├── utils/
│       │   └── validation.js      # Shared email validation + pagination helper
│       ├── routes/
│       │   ├── auth.js            # Routes: signup, login
│       │   ├── programs.js        # Routes: list all programs
│       │   ├── locations.js       # Routes: list all locations
│       │   ├── timeSlots.js       # Routes: list available slots by program/mode/location/date
│       │   ├── registrations.js   # Routes: parent submits registration, views own status
│       │   ├── students.js        # Routes: parent creates/lists own students
│       │   └── admin.js           # Routes: admin lists (paginated), summary, query, CRUD, review
│       └── controllers/
│           ├── authController.js          # Logic for signup, login, domain-based role assignment
│           ├── programController.js       # Logic for fetching/creating programs
│           ├── locationController.js      # Logic for fetching locations
│           ├── timeSlotController.js      # Logic for fetching slots, capacity checks
│           ├── registrationController.js  # Logic for submitting registration (atomic RPC)
│           ├── studentController.js       # Logic for parent student records
│           └── adminController.js         # Logic for admin views, summary, query, approve/reject
├── database/
│   ├── schema.sql                 # CREATE TABLE statements for all 7 tables
│   ├── seed.sql                   # Seed data (currently empty)
│   └── review_registration.sql    # Postgres function for atomic admin approve/reject
└── docs/
    └── architecture.md            # System design documentation
```

> **Note:** `POST /registrations` calls a Postgres `register_with_capacity()` function (see `docs/architecture.md`).

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

Apply the SQL artifacts to your Supabase project **in order**:

1. `database/schema.sql` — enums + all 7 tables, constraints, indexes
2. `database/review_registration.sql` — atomic approve/reject function
3. `register_with_capacity()` — required by `POST /registrations`; not in the repo, apply separately (see `docs/architecture.md` §6)

### 3. Backend (server)
```bash
cd server
npm install
```

Create `server/.env` with:

```
SUPABASE_URL=<your Supabase Postgres connection string>
SUPABASE_SERVICE_ROLE_KEY=<service-role key — privileged backend ops>
SUPABASE_ANON_KEY=<anon/public key — user-facing auth>
PORT=<port to listen on, e.g. 3000>

# Integration tests only (a real non-@sc4k.ca parent login):
Run the following commands in the terminal:-
  $env:TEST_PARENT_EMAIL="you@example.com"
  $env:TEST_PARENT_PASSWORD="yourpassword"

Ignore:
CORS_ORIGIN=<comma-separated allowed origins; leave empty to allow none>
```

`PORT` is required — the server exits on startup if it is unset.

```bash
npm start          # or: npm run dev  (nodemon)
npm test           # Vitest integration suite — hits LIVE Supabase.
                   # Creates+auto-deletes real rows; admin tests are
                   # skipped unless @sc4k.ca admin creds are added.
                   # Parent suites skip if TEST_PARENT_* is unset.
```

### 4. Frontend (client)
```bash
cd client
npm install
```

Create `client/.env.local` with:

```
EXPO_PUBLIC_API_URL=<backend base URL, e.g. http://localhost:8000>
EXPO_PUBLIC_SUPABASE_URL=<your Supabase project URL>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon/publishable key from Supabase Settings → API>
```

All three are required — `lib/supabase.js` throws on startup if the Supabase
vars are missing, and `api/client.js` needs the API URL for every backend call.

```bash
npx expo start    # add -c to clear cache after changing env
```

## Running the App

- **Physical device**: Scan the QR code with Expo Go (Android) or Camera app (iOS)
- **Emulator**: Press `a` (Android) or `i` (iOS) in the terminal
