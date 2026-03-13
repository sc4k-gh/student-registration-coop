# API Endpoints — Student Registration App

## 1. Overview

All API endpoints are served from the Express.js backend hosted on Render. The base URL pattern:

```
https://<render-app-name>.onrender.com/api/v1
```

All requests (except auth) require a valid Supabase JWT token in the `Authorization` header:
```
Authorization: Bearer <supabase_jwt_token>
```

---

## 2. Endpoint Summary

| Method | Endpoint | Role | Description |
|---|---|---|---|
| **Auth** | | | |
| POST | `/auth/signup` | Public | Register a new parent account |
| POST | `/auth/login` | Public | Login with email/password |
| POST | `/auth/google` | Public | Login/register with Google OAuth |
| POST | `/auth/logout` | Authenticated | Logout and invalidate session |
| GET | `/auth/me` | Authenticated | Get current user profile |
| **Programs** | | | |
| GET | `/programs` | Authenticated | List programs (filterable by age) |
| POST | `/programs` | Admin | Create a new program |
| PUT | `/programs/:id` | Admin | Update a program |
| DELETE | `/programs/:id` | Admin | Deactivate a program |
| **Schedules** | | | |
| GET | `/programs/:programId/schedules` | Authenticated | List schedules for a program |
| POST | `/programs/:programId/schedules` | Admin | Add a schedule/time slot |
| PUT | `/schedules/:id` | Admin | Update a schedule |
| DELETE | `/schedules/:id` | Admin | Deactivate a schedule |
| **Locations** | | | |
| GET | `/locations` | Authenticated | List all active locations |
| POST | `/locations` | Admin | Add a location |
| PUT | `/locations/:id` | Admin | Update a location |
| **Students** | | | |
| POST | `/students` | Parent | Create a student record |
| GET | `/students` | Admin | List all students |
| GET | `/students/mine` | Parent | List parent's own students |
| **Registrations** | | | |
| POST | `/registrations` | Parent | Submit a registration |
| GET | `/registrations` | Admin | List all registrations |
| GET | `/registrations/mine` | Parent | List parent's own registrations |
| **Attendance** | | | |
| POST | `/attendance` | Admin | Mark attendance for a session |
| GET | `/attendance/:registrationId` | Admin | View attendance for a registration |
| **Makeup Classes** | | | |
| POST | `/makeup-classes` | Admin | Create a makeup class record |
| PUT | `/makeup-classes/:id` | Admin | Update makeup class status |
| GET | `/makeup-classes` | Admin | List all makeup classes (filterable by status) |

---

## 3. Endpoint Details

### 3.1 Authentication

#### `POST /auth/signup`
Register a new parent account.

- **Access**: Public
- **Request Body**:
```json
{
  "email": "parent@example.com",
  "password": "securepassword123",
  "full_name": "Jane Doe",
  "phone": "+1234567890"
}
```
- **Response** `201`:
```json
{
  "message": "Account created successfully",
  "user": {
    "id": "uuid",
    "email": "parent@example.com",
    "full_name": "Jane Doe",
    "role": "parent"
  },
  "token": "supabase_jwt_token"
}
```
- **Errors**: `400` validation error, `409` email already exists

---

#### `POST /auth/login`
Login with email and password.

- **Access**: Public
- **Request Body**:
```json
{
  "email": "parent@example.com",
  "password": "securepassword123"
}
```
- **Response** `200`:
```json
{
  "user": {
    "id": "uuid",
    "email": "parent@example.com",
    "full_name": "Jane Doe",
    "role": "parent"
  },
  "token": "supabase_jwt_token"
}
```
- **Errors**: `401` invalid credentials

---

#### `POST /auth/google`
Authenticate via Google OAuth. Creates account if first time.

- **Access**: Public
- **Request Body**:
```json
{
  "google_id_token": "token_from_google_sign_in"
}
```
- **Response** `200`:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@gmail.com",
    "full_name": "Jane Doe",
    "role": "parent"
  },
  "token": "supabase_jwt_token",
  "is_new_user": true
}
```

---

#### `POST /auth/logout`
Invalidate the current session.

- **Access**: Authenticated
- **Response** `200`:
```json
{
  "message": "Logged out successfully"
}
```

---

#### `GET /auth/me`
Get the current authenticated user's profile.

- **Access**: Authenticated
- **Response** `200`:
```json
{
  "user": {
    "id": "uuid",
    "email": "parent@example.com",
    "full_name": "Jane Doe",
    "phone": "+1234567890",
    "role": "parent",
    "created_at": "2026-03-08T00:00:00Z"
  }
}
```

---

### 3.2 Programs

#### `GET /programs`
List programs, optionally filtered by student age.

- **Access**: Authenticated (Parent or Admin)
- **Query Params**:
  - `age` (optional) — filters programs where `min_age <= age <= max_age`
- **Response** `200`:
```json
{
  "programs": [
    {
      "id": "uuid",
      "name": "Piano Basics",
      "min_age": 5,
      "max_age": 8,
      "description": "Introductory piano course for young learners",
      "is_active": true
    }
  ]
}
```

---

#### `POST /programs`
Create a new program.

- **Access**: Admin only
- **Request Body**:
```json
{
  "name": "Piano Basics",
  "min_age": 5,
  "max_age": 8,
  "description": "Introductory piano course for young learners"
}
```
- **Response** `201`:
```json
{
  "message": "Program created",
  "program": { "id": "uuid", "name": "Piano Basics", "..." : "..." }
}
```

---

#### `PUT /programs/:id`
Update an existing program.

- **Access**: Admin only
- **Request Body**: Any subset of `name`, `min_age`, `max_age`, `description`, `is_active`
- **Response** `200`: Updated program object
- **Errors**: `404` program not found

---

#### `DELETE /programs/:id`
Soft-delete (deactivate) a program.

- **Access**: Admin only
- **Response** `200`:
```json
{
  "message": "Program deactivated"
}
```

---

### 3.3 Schedules

#### `GET /programs/:programId/schedules`
List all active schedules for a specific program.

- **Access**: Authenticated
- **Response** `200`:
```json
{
  "schedules": [
    {
      "id": "uuid",
      "program_id": "uuid",
      "day_of_week": "Monday",
      "start_time": "16:00",
      "end_time": "17:00",
      "mode": "in_person",
      "location": {
        "id": "uuid",
        "name": "Downtown Center"
      }
    },
    {
      "id": "uuid",
      "program_id": "uuid",
      "day_of_week": "Wednesday",
      "start_time": "18:00",
      "end_time": "19:00",
      "mode": "online",
      "location": null
    }
  ]
}
```

---

#### `POST /programs/:programId/schedules`
Add a new time slot to a program.

- **Access**: Admin only
- **Request Body**:
```json
{
  "day_of_week": "Monday",
  "start_time": "16:00",
  "end_time": "17:00",
  "mode": "in_person",
  "location_id": "uuid"
}
```
- **Response** `201`: Created schedule object

---

#### `PUT /schedules/:id`
Update an existing schedule.

- **Access**: Admin only
- **Request Body**: Any subset of schedule fields
- **Response** `200`: Updated schedule object

---

#### `DELETE /schedules/:id`
Deactivate a schedule.

- **Access**: Admin only
- **Response** `200`:
```json
{
  "message": "Schedule deactivated"
}
```

---

### 3.4 Locations

#### `GET /locations`
List all active locations.

- **Access**: Authenticated
- **Response** `200`:
```json
{
  "locations": [
    {
      "id": "uuid",
      "name": "Downtown Center",
      "address": "123 Main St, City"
    }
  ]
}
```

---

#### `POST /locations`
Add a new location.

- **Access**: Admin only
- **Request Body**:
```json
{
  "name": "Downtown Center",
  "address": "123 Main St, City"
}
```
- **Response** `201`: Created location object

---

### 3.5 Students

#### `POST /students`
Create a student record (called during registration flow).

- **Access**: Parent only
- **Request Body**:
```json
{
  "name": "Alex Doe",
  "email": "alex@example.com",
  "phone_primary": "+1234567890",
  "phone_secondary": "+0987654321",
  "age": 7
}
```
- **Response** `201`:
```json
{
  "message": "Student created",
  "student": { "id": "uuid", "name": "Alex Doe", "..." : "..." }
}
```

> [!NOTE]
> `parent_id` is automatically set from the authenticated user's JWT — parents cannot create students under other parents.

---

#### `GET /students`
List all students across all parents.

- **Access**: Admin only
- **Response** `200`: Array of student objects with parent info

---

#### `GET /students/mine`
List the current parent's registered students.

- **Access**: Parent only
- **Response** `200`:
```json
{
  "students": [
    {
      "id": "uuid",
      "name": "Alex Doe",
      "age": 7,
      "registrations": [ "..." ]
    }
  ]
}
```

---

### 3.6 Registrations

#### `POST /registrations`
Submit a student registration (links student → program → schedule → location).

- **Access**: Parent only
- **Request Body**:
```json
{
  "student_id": "uuid",
  "program_id": "uuid",
  "schedule_id": "uuid",
  "location_id": "uuid or null"
}
```
- **Response** `201`:
```json
{
  "message": "Registration submitted",
  "registration": {
    "id": "uuid",
    "student_id": "uuid",
    "program_id": "uuid",
    "schedule_id": "uuid",
    "location_id": "uuid",
    "registered_at": "2026-03-08T00:00:00Z"
  }
}
```
- **Errors**: `400` student already registered for this program, `404` invalid IDs

> [!IMPORTANT]
> The student + student details + registration can be submitted together in a single form. The backend can accept a combined payload and handle both creation steps internally.

---

#### `GET /registrations`
List all registrations with student, program, and schedule details.

- **Access**: Admin only
- **Response** `200`: Array of registration objects with joined data

---

#### `GET /registrations/mine`
List the current parent's registrations.

- **Access**: Parent only
- **Response** `200`: Array of the parent's registration objects

---

### 3.7 Attendance

#### `POST /attendance`
Mark a student's attendance for a specific class date.

- **Access**: Admin only
- **Request Body**:
```json
{
  "registration_id": "uuid",
  "class_date": "2026-03-08",
  "is_present": false,
  "notes": "Called in sick"
}
```
- **Response** `201`:
```json
{
  "message": "Attendance recorded",
  "attendance": { "id": "uuid", "..." : "..." }
}
```

---

#### `GET /attendance/:registrationId`
Get full attendance history for a registration.

- **Access**: Admin only
- **Response** `200`:
```json
{
  "attendance": [
    {
      "id": "uuid",
      "class_date": "2026-03-08",
      "is_present": true,
      "notes": null,
      "marked_at": "2026-03-08T17:00:00Z"
    }
  ],
  "summary": {
    "total_classes": 10,
    "present": 8,
    "absent": 2,
    "attendance_rate": "80%"
  }
}
```

---

### 3.8 Makeup Classes

#### `POST /makeup-classes`
Create a makeup class record when a student misses a class.

- **Access**: Admin only
- **Request Body**:
```json
{
  "attendance_id": "uuid",
  "registration_id": "uuid",
  "admin_notes": "Student called in with a valid reason"
}
```
- **Response** `201`: Created with status `PENDING`

---

#### `PUT /makeup-classes/:id`
Update the status of a makeup class.

- **Access**: Admin only
- **Request Body**:
```json
{
  "status": "APPROVED",
  "admin_notes": "Scheduled for next Wednesday"
}
```
- **Valid transitions**: `PENDING → APPROVAL_PENDING → APPROVED → COMPLETE`
- **Response** `200`: Updated makeup class object
- **Errors**: `400` invalid status transition

---

#### `GET /makeup-classes`
List all makeup classes, filterable by status.

- **Access**: Admin only
- **Query Params**:
  - `status` (optional) — filter by status (`PENDING`, `APPROVAL_PENDING`, `APPROVED`, `COMPLETE`)
  - `registration_id` (optional) — filter by specific registration
- **Response** `200`:
```json
{
  "makeup_classes": [
    {
      "id": "uuid",
      "student_name": "Alex Doe",
      "program_name": "Piano Basics",
      "missed_date": "2026-03-08",
      "status": "PENDING",
      "admin_notes": "..."
    }
  ]
}
```

---

## 4. Error Response Format

All errors follow a consistent format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [
      { "field": "email", "message": "Email is required" }
    ]
  }
}
```

| HTTP Status | Code | Description |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Invalid request body or params |
| `401` | `UNAUTHORIZED` | Missing or invalid auth token |
| `403` | `FORBIDDEN` | Insufficient permissions (wrong role) |
| `404` | `NOT_FOUND` | Resource not found |
| `409` | `CONFLICT` | Duplicate resource (e.g., email exists) |
| `500` | `INTERNAL_ERROR` | Server error |
