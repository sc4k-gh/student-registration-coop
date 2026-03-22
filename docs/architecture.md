# System Design Architecture — Student Registration App (POC)

## Context
This is a POC for a **tutoring academy** student registration mobile app (iOS + Android). Parents register students into tutoring programs with fixed time slots. Admin reviews and approves registrations. Faculty features are out of POC scope.

---

## 1. Functional Requirements

### Authentication
- Role-based auth: **Admin** and **Parent** for POC
- Future roles: Student, Faculty (not in POC)
- Admin: email pre-seeded via DB seed script; admin sets their own password on first login (invite/setup flow)
- Parent: sign-up / login flow

### Admin Features
- **Dynamic dashboard** with multiple tabular views (each is a separate screen/tab):

| View | Data Shown | Query Path |
|------|-----------|------------|
| Students list | Student name, enrolled program, age, parent contact | `students` → `registrations` → `programs` |
| Teachers list | Teacher name, courses, time slots | `teachers` → `time_slots` → `programs` |
| Teacher → Students | Which teacher has which students, on what days, with contact details | `teachers` → `time_slots` → `registrations` → `students` |
| Program details | Name, level, age range, description, slot counts | `programs` → `time_slots` |
| Registrations queue | Pending registrations to approve/reject | `registrations` WHERE pending → `students` → `time_slots` |

- Manage programs, time slots, locations, and teachers (CRUD)

### Parent Features
- Register one or more children
- Registration form per child:
  - Student name *(required)*
  - Student email *(optional)*
  - Student phone number *(optional)*
  - Age *(required)*
  - Description about the student *(optional)*
  - Parent name *(required)*
  - Parent email *(required)*
  - Parent phone number *(required)*
  - Program selection *(required)*
  - Mode: Online / In-person (dropdown) *(required)*
    - If in-person → select location (dropdown)
  - Calendar picker (Mon–Sun): choose from **available fixed time slots** filtered by program + mode + location
    - Slots that are full (5/5) are shown as unavailable

### Scheduling & Capacity
- Admin pre-defines fixed time slots per program, per day, per mode/location
- Each slot has a max capacity of **5 students**
- A `current_count` field on each slot tracks active headcount (pending + approved registrations)
- If `current_count >= 5`, the slot is unavailable for new registrations

### Post-Registration Flow
- Admin reviews upon getting the request
- Admin reaches out to parent (outside of the app)

---

## 2. Non-Functional Requirements

| Requirement | Target |
|---|---|
| **Platform** | iOS + Android (React Native) |
| **Availability** | Standard — single-region deployment acceptable for POC |
| **Latency** | < 500ms for API responses |
| **Security** | JWT-based auth, HTTPS, password hashing (bcrypt), role-based access control |
| **Scalability** | POC scale (~100s of users); schema designed to scale later |
| **Data Integrity** | Capacity checks must be atomic to prevent overbooking |

---

## 3. Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Frontend** | React Native (Expo) | Cross-platform iOS + Android |
| **State Management** | React Query | Pairs well with Supabase for data fetching/caching |
| **Backend/API** | Node.js (Express) | Handles all CRUD operations, business logic, and capacity checks |
| **Database** | PostgreSQL (Supabase) | Supabase as hosted Postgres provider; CRUD queries go through the Node.js API |
| **Authentication** | Supabase Auth | Handles sign-up, login, session management, JWT issuance. Node.js validates Supabase JWTs via middleware for role-based access. |
| **Build & Deploy** | EAS Build (Expo) | Generates iOS + Android binaries for App Store / Google Play |
| **API Hosting** | Render | Hosts the Node.js Express server |

---

## 4. High-Level Design

```
┌─────────────────────────────────────────────────┐
│              Mobile App (React Native)           │
│         iOS + Android                            │
│  ┌───────────┐  ┌───────────┐  ┌──────────────┐ │
│  │  Auth      │  │  Parent   │  │  Admin       │ │
│  │  Screens   │  │  Screens  │  │  Screens     │ │
│  └───────────┘  └───────────┘  └──────────────┘ │
└────────────────────┬────────────────────────────┘
                     │ HTTPS / REST
                     ▼
┌─────────────────────────────────────────────────┐
│              API Server (Node.js / Express)        │
│                                                   │
│  ┌──────────┐ ┌──────────────┐ ┌──────────────┐ │
│  │ Auth      │ │ Registration │ │ Admin        │ │
│  │ Module    │ │ Module       │ │ Module       │ │
│  │ (JWT)     │ │ (capacity    │ │ (CRUD +      │ │
│  │           │ │  checks)     │ │  approvals)  │ │
│  └──────────┘ └──────────────┘ └──────────────┘ │
│                                                   │
│  Middleware: Auth guard, Role guard, Validation   │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│        Supabase (PostgreSQL — DB only)              │
│  users, students, programs, locations,              │
│  teachers, time_slots, registrations                │
└─────────────────────────────────────────────────┘
```

### API Endpoints (Key)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/auth/signup` | Public | Parent sign-up |
| POST | `/auth/setup-password` | Admin | Admin sets password on first login (email must be pre-seeded) |
| POST | `/auth/login` | Public | Login (returns JWT) |
| GET | `/programs` | Any | List all programs |
| GET | `/locations` | Any | List all locations |
| GET | `/time-slots?program_id=&mode=&location_id=` | Any | List available slots with capacity info |
| POST | `/registrations` | Parent | Submit a registration |
| GET | `/registrations/my` | Parent | View own registrations + status |
| GET | `/admin/students` | Admin | All students with program + parent info |
| GET | `/admin/teachers` | Admin | All teachers with their courses + slots |
| GET | `/admin/teachers/:id/students` | Admin | Students under a specific teacher, by day, with contact details |
| GET | `/admin/programs/:id` | Admin | Program detail with slot counts |
| GET | `/admin/registrations` | Admin | Pending registrations queue |
| PATCH | `/admin/registrations/:id` | Admin | Approve or reject a registration |
| POST | `/admin/programs` | Admin | Create program |
| POST | `/admin/time-slots` | Admin | Create time slot |
| POST | `/admin/teachers` | Admin | Add teacher |

---

## 5. Database Schema

### `users`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Login email |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt |
| role | ENUM('admin','parent') | NOT NULL | Expandable later |
| name | VARCHAR(255) | NOT NULL | |
| phone_number | VARCHAR(20) | NULL | Required for parents |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW | |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW | |

### `students`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| parent_id | UUID | FK → users.id, NOT NULL | |
| student_name | VARCHAR(255) | NOT NULL | **Required** |
| student_email | VARCHAR(255) | NULL | Optional |
| student_phone | VARCHAR(20) | NULL | Optional |
| age | INT | NOT NULL | **Required** |
| description | TEXT | NULL | About the student |
| parent_name | VARCHAR(255) | NOT NULL | **Required** (denormalized for form) |
| parent_email | VARCHAR(255) | NOT NULL | **Required** |
| parent_phone | VARCHAR(20) | NOT NULL | **Required** |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW | |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW | |

> One parent (user) can have multiple students (children).

### `programs`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| name | VARCHAR(255) | NOT NULL | e.g., "Python Programming" |
| level | ENUM('beginner','intermediate','advanced') | NOT NULL | |
| target_age | VARCHAR(50) | NOT NULL | e.g., "8-12" or "13-17" |
| description | TEXT | NULL | About the program |
| prerequisites | TEXT | NULL | What's needed before enrolling |
| status | ENUM('active','inactive') | NOT NULL, DEFAULT 'active' | |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW | |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW | |

### `locations`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| name | VARCHAR(255) | NOT NULL | e.g., "Main Campus" |
| address | VARCHAR(500) | NULL | |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW | |

> Small fixed list. No `is_active` field per user request.

### `teachers`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| name | VARCHAR(255) | NOT NULL | |
| email | VARCHAR(255) | UNIQUE, NULL | |
| phone_number | VARCHAR(20) | NULL | |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW | |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW | |

> Teachers don't have login in POC. Admin manages their records. FK from `time_slots` enables teacher ↔ course/slot queries.

### `time_slots`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| program_id | UUID | FK → programs.id, NOT NULL | |
| teacher_id | UUID | FK → teachers.id, NULL | Enables teacher-course joins |
| location_id | UUID | FK → locations.id, NULL | NULL = online |
| mode | ENUM('online','in-person') | NOT NULL | |
| day_of_week | ENUM('mon','tue','wed','thu','fri','sat','sun') | NOT NULL | |
| start_time | TIME | NOT NULL | e.g., 17:00 |
| end_time | TIME | NOT NULL | e.g., 18:00 |
| max_capacity | INT | NOT NULL, DEFAULT 5 | |
| current_count | INT | NOT NULL, DEFAULT 0 | Active headcount (pending + approved) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW | |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW | |

> **Capacity rule**: slot is unavailable when `current_count >= max_capacity`.
> `current_count` is incremented on new registration + enrolled, decremented on rejection/cancellation.

### `registrations`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| student_id | UUID | FK → students.id, NOT NULL | |
| program_id | UUID | FK → programs.id, NOT NULL | |
| time_slot_id | UUID | FK → time_slots.id, NOT NULL | |
| status | ENUM('pending','approved','rejected') | NOT NULL, DEFAULT 'pending' | |
| submitted_at | TIMESTAMP | NOT NULL, DEFAULT NOW | |
| reviewed_at | TIMESTAMP | NULL | |
| reviewed_by | UUID | FK → users.id, NULL | Admin who reviewed |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW | |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW | |

> **Unique constraint**: (student_id, time_slot_id) — prevents duplicate registration to same slot.
> On INSERT: increment `time_slots.current_count`. On reject: decrement.

---

### ER Relationships Summary

```
users (parent) ──1:N──▶ students
students ──1:N──▶ registrations
programs ──1:N──▶ time_slots
teachers ──1:N──▶ time_slots
locations ──1:N──▶ time_slots
time_slots ──1:N──▶ registrations
programs ──1:N──▶ registrations
users (admin) ──1:N──▶ registrations (reviewed_by)
```

---

## 6. Verification

- Review schema covers all form fields from the registration flow
- Confirm capacity logic: `current_count` on `time_slots` accurately reflects pending + approved registrations
- Admin can query teacher-course relationships via `time_slots.teacher_id` JOIN `teachers`
- Admin can query student-teacher relationships via `registrations` → `time_slots` → `teachers`
- One parent can register multiple children (1:N users → students)
- One student enrolls in one program at a time (one registration active per student)
