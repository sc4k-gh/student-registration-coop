# Authentication & Authorization Flow — Student Registration App

## 1. Overview

Authentication is handled by **Supabase Auth**, which manages user credentials, sessions, and JWT tokens. The Express backend verifies tokens and enforces role-based access control.

| Auth Provider | Supported Roles |
|---|---|
| Email / Password | Parent, Admin |
| Google OAuth | Parent, Admin |

---

## 2. Roles & Permissions

| Permission | Parent | Admin |
|---|---|---|
| Sign up (self-register) | ✅ | ❌ (seeded only) |
| Login | ✅ | ✅ |
| View/fill registration form | ✅ | ❌ |
| Create student records | ✅ | ❌ |
| View own registrations | ✅ | ❌ |
| View all registrations | ❌ | ✅ |
| Manage programs/schedules | ❌ | ✅ |
| Mark attendance | ❌ | ✅ |
| Manage makeup classes | ❌ | ✅ |

---

## 3. Authentication Flows

### 3.1 Parent Sign-Up (Email/Password)

```mermaid
sequenceDiagram
    participant P as Parent (App)
    participant E as Express API
    participant SA as Supabase Auth
    participant DB as PostgreSQL

    P->>E: POST /auth/signup { email, password, full_name, phone }
    E->>E: Validate input fields
    E->>SA: supabase.auth.signUp({ email, password })
    SA-->>E: { user: { id }, session: { access_token } }
    E->>DB: INSERT INTO users (id, email, full_name, phone, role='parent')
    DB-->>E: User created
    E-->>P: 201 { user, token }
```

**Key points:**
- The `users.id` matches the Supabase Auth `auth.users.id`
- Role is always `parent` for self-registered users
- Password hashing is handled entirely by Supabase Auth

---

### 3.2 Parent Sign-Up (Google OAuth)

```mermaid
sequenceDiagram
    participant P as Parent (App)
    participant G as Google Sign-In
    participant E as Express API
    participant SA as Supabase Auth
    participant DB as PostgreSQL

    P->>G: Initiate Google Sign-In (Expo)
    G-->>P: Google ID Token

    P->>E: POST /auth/google { google_id_token }
    E->>SA: supabase.auth.signInWithIdToken({ provider: 'google', token })
    SA-->>E: { user: { id, email }, session: { access_token } }

    E->>DB: SELECT * FROM users WHERE id = user.id
    alt User does NOT exist
        E->>DB: INSERT INTO users (id, email, full_name, role='parent')
        DB-->>E: User created
        E-->>P: 200 { user, token, is_new_user: true }
    else User exists
        E-->>P: 200 { user, token, is_new_user: false }
    end
```

**Key points:**
- Google Sign-In is handled by Expo's Google Auth package on the client
- The client sends the Google ID token to the Express API
- The Express API uses Supabase's `signInWithIdToken` to verify and create/link the user

---

### 3.3 Login (Email/Password)

```mermaid
sequenceDiagram
    participant U as User (App)
    participant E as Express API
    participant SA as Supabase Auth
    participant DB as PostgreSQL

    U->>E: POST /auth/login { email, password }
    E->>SA: supabase.auth.signInWithPassword({ email, password })
    SA-->>E: { user: { id }, session: { access_token } }
    E->>DB: SELECT role FROM users WHERE id = user.id
    DB-->>E: { role: 'parent' | 'admin' }
    E-->>U: 200 { user (with role), token }
```

**Post-login routing:**
- If `role === 'parent'` → Navigate to Registration Form
- If `role === 'admin'` → Navigate to Admin Dashboard

---

### 3.4 Admin Login

Admin login uses the **same** login endpoints (email/password or Google OAuth). The difference is:
- Admin accounts are **pre-seeded** in both Supabase Auth and the `users` + `admins` tables
- The `role` field in `users` is set to `admin`
- The Express middleware detects the admin role and grants elevated permissions

---

## 4. Token Management

### 4.1 JWT Structure

Supabase issues JWTs containing:
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "authenticated",
  "aud": "authenticated",
  "exp": 1709942400
}
```

### 4.2 Token Lifecycle

| Event | Action |
|---|---|
| Login/Signup | Supabase returns `access_token` + `refresh_token` |
| API Request | Client sends `access_token` in `Authorization: Bearer <token>` header |
| Token Expiry | Client uses `refresh_token` to get a new `access_token` via Supabase SDK |
| Logout | Client calls Supabase `signOut()`, tokens are invalidated |

### 4.3 Client-Side Token Storage

Tokens are stored securely on the device using Expo's `SecureStore` (encrypted key-value storage). The Supabase client SDK handles this automatically when configured.

---

## 5. Express Middleware

### 5.1 Auth Middleware

Every protected route passes through auth middleware that:

1. Extracts the JWT from the `Authorization` header
2. Verifies the token with Supabase
3. Fetches the user's role from the `users` table
4. Attaches `req.user` with `{ id, email, role }` for downstream use

```
Request → [Auth Middleware] → [Role Check Middleware] → [Controller]
```

### 5.2 Role Check Middleware

Granular role enforcement per route:

```
requireRole('admin')    → Only admins can access
requireRole('parent')   → Only parents can access
requireAuth()           → Any authenticated user can access
```

---

## 6. Admin Account Seeding

Since admins cannot self-register, accounts are created via a **seed script**:

```
Admin Data Required:
├── Supabase Auth account (email + password)
├── users table entry (id, email, full_name, role='admin')
└── admins table entry (user_id, admin_name, org_name, org_email)
```

**Max 5 admin accounts** for the POC.

The seed script creates:
1. A Supabase Auth user with the admin's email and password
2. A row in `users` with `role = 'admin'`
3. A row in `admins` with org details

---

## 7. Security Summary

| Concern | Approach |
|---|---|
| Password storage | Handled by Supabase (bcrypt) |
| Token verification | Supabase JWT verification on every request |
| Role enforcement | Express middleware checks `users.role` |
| Secure token storage | Expo SecureStore on device |
| HTTPS | Enforced by Render and Supabase |
| Admin creation | Seed script only (no self-registration) |
| Parent data isolation | Parents can only access their own students/registrations |
