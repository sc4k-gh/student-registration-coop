# System Architecture — Student Registration App

## 1. Overview

The Student Registration App is a production-ready POC that enables **parents** to register their children for programs/courses, and **admins** to view registrations, manage schedules, and track attendance. It is built as a cross-platform mobile application targeting both iOS and Android.

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Mobile Client** | React Native | Cross-platform iOS & Android app |
| **Navigation** | React Navigation v7 (Stack + Drawer) | In-app routing and screen management |
| **Backend API** | Node.js + Express.js | REST API server, business logic |
| **Database** | PostgreSQL (via Supabase) | Persistent data storage |
| **Authentication** | Supabase Auth | Email/Password + Google OAuth |
| **API Hosting** | Render | Express server deployment |
| **DB Hosting** | Supabase | Managed PostgreSQL instance |
| **App Distribution** | Apple App Store / Google Play Store | End-user delivery |

---

## 3. High-Level Architecture

```mermaid
graph TB
    subgraph Client["Mobile App (React Native / Expo)"]
        UI["UI Layer (Screens)"]
        NAV["Navigation (Stack + Drawer)"]
        CACHE["Local Cache (Program/Schedule Data)"]
        API_SVC["API Service Layer"]
    end

    subgraph Backend["Express Server (Render)"]
        ROUTER["Express Router"]
        MW["Middleware (Auth, Validation)"]
        CTRL["Controllers"]
        SVC["Service Layer"]
    end

    subgraph Database["Supabase"]
        AUTH["Supabase Auth"]
        PG["PostgreSQL Database"]
    end

    UI --> NAV
    UI --> API_SVC
    API_SVC --> CACHE
    API_SVC -->|HTTPS REST| ROUTER
    ROUTER --> MW
    MW --> CTRL
    CTRL --> SVC
    SVC --> PG
    API_SVC -->|Auth Requests| AUTH
    MW -->|Token Verification| AUTH
```

---

## 4. Project Structure (Proposed)

```
student-registration-coop/
├── client/                     # React Native (Expo) mobile app
│   ├── src/
│   │   ├── assets/             # Static assets (images, fonts)
│   │   ├── components/         # Reusable UI components
│   │   ├── navigation/         # Stack & Drawer navigators
│   │   ├── screens/            # Screen-level components
│   │   ├── services/           # API client & Supabase SDK calls
│   │   ├── cache/              # Client-side caching logic
│   │   ├── styles/             # Global styles and theme
│   │   ├── utils/              # Helper functions
│   │   └── App.js              # Entry point
│   └── package.json
│
├── server/                     # Express.js backend (NEW)
│   ├── src/
│   │   ├── config/             # DB connection, env config
│   │   ├── middleware/         # Auth, validation, error handling
│   │   ├── routes/             # Route definitions
│   │   ├── controllers/       # Request handlers
│   │   ├── services/          # Business logic
│   │   ├── models/            # Data access layer
│   │   └── app.js             # Express app setup
│   ├── package.json
│   └── .env.example
│
├── database/
│   └── schema.sql              # PostgreSQL schema
│
└── docs/                       # System design documents
    ├── architecture.md
    ├── db-schema.md
    ├── api-endpoints.md
    ├── auth-flow.md
    ├── registration-flow.md
    └── attendance.md
```

---

## 5. Data Flow

### 5.1 Parent Registration Flow

```mermaid
sequenceDiagram
    participant P as Parent (Mobile App)
    participant A as Supabase Auth
    participant E as Express API (Render)
    participant D as PostgreSQL (Supabase)

    P->>A: Sign up (Email/Password or Google OAuth)
    A-->>P: JWT Token

    P->>E: GET /api/programs?age={childAge}
    Note over P: Cached locally after first fetch
    E->>D: Query programs filtered by age
    D-->>E: Programs list
    E-->>P: Programs list

    P->>E: GET /api/schedules?programId={id}
    E->>D: Query available days/time slots
    D-->>E: Schedule data
    E-->>P: Schedule data (day, time, online/in-person)

    P->>E: POST /api/registrations
    Note over P: Sends: name, email, phone(s), age,<br/>program, schedule, location (if in-person)
    E->>D: Insert registration record
    D-->>E: Confirmation
    E-->>P: Registration success
```

### 5.2 Admin Attendance Flow

```mermaid
sequenceDiagram
    participant AD as Admin (Mobile App)
    participant E as Express API (Render)
    participant D as PostgreSQL (Supabase)

    AD->>E: GET /api/registrations
    E->>D: Query all registrations
    D-->>E: Registration list
    E-->>AD: Registration list

    AD->>E: POST /api/attendance
    Note over AD: Mark student as present/absent
    E->>D: Insert attendance record
    D-->>E: Confirmation
    E-->>AD: Attendance marked

    alt Student Absent (Makeup Needed)
        AD->>E: POST /api/makeup-classes
        Note over AD: Status: PENDING
        E->>D: Insert makeup record
        D-->>E: Confirmation
        E-->>AD: Makeup class created
    end
```

---

## 6. Deployment Topology

```mermaid
graph LR
    subgraph Users["End Users"]
        IOS["iOS Device"]
        AND["Android Device"]
    end

    subgraph Distribution["App Stores"]
        AS["Apple App Store"]
        GP["Google Play Store"]
    end

    subgraph Cloud["Cloud Services"]
        RENDER["Render (Express API)"]
        SUPA_AUTH["Supabase Auth"]
        SUPA_DB["Supabase PostgreSQL"]
    end

    IOS --> AS
    AND --> GP
    AS --> RENDER
    GP --> RENDER
    RENDER --> SUPA_DB
    IOS --> SUPA_AUTH
    AND --> SUPA_AUTH
    RENDER --> SUPA_AUTH
```

**Deployment summary:**
- **Mobile App** → Built with Expo EAS, published to App Store & Google Play
- **Express API** → Deployed on Render (free/starter tier for POC)
- **Database** → Supabase managed PostgreSQL (free tier for POC)
- **Auth** → Supabase Auth (handles OAuth + email/password, free tier)

---

## 7. Client-Side Caching Strategy

Since program/schedule data changes **rarely**, the client caches this data to minimize API calls:

| Data | When to fetch | Cache duration |
|---|---|---|
| Programs (by age) | On registration form open | Until app restart or manual refresh |
| Schedules (by program) | On program selection | Until app restart or manual refresh |
| Locations | On registration form open | Until app restart or manual refresh |

The cache layer sits in `client/src/cache/` and uses in-memory storage. If the app is restarted, data is re-fetched.

---

## 8. Security Considerations (POC Level)

- All API requests authenticated via **Supabase JWT tokens** passed in `Authorization` header
- Express middleware **verifies tokens** with Supabase before processing requests
- **Role-based access**: middleware checks user role (parent vs admin) per endpoint
- HTTPS enforced on Render and Supabase (default)
- Admin accounts are **seeded** initially (max 5), not self-registered
