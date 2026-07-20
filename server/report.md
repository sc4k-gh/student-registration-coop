# Backend Code Review — Student Registration App (POC)

**Reference spec:** `docs/architecture.md` (ground truth) · **Scope:** `server/` · **Date:** 2026-05-17

## Summary

The Express backend predates the finalized spec and has drifted. Three issues are **Critical** — they break the two core flows (signup and registration) at runtime against the now-applied `schema.sql` / `register_with_capacity.sql`. Two **High** issues make the entire admin surface unreachable and leak slot capacity. The rest are spec deviations, missing POC endpoints, and standard hardening deferred as out-of-POC-scope. Counts: **3 Critical · 2 High · 7 Medium · 5 Deferred**.

## Severity legend

| Severity | Meaning |
|---|---|
| **Critical** | Breaks a core flow at runtime; POC is non-functional until fixed. |
| **High** | Spec contradiction; a whole feature is unreachable or data integrity is violated. |
| **Medium** | Spec deviation or a missing POC feature; flow degraded but not dead. |
| **Deferred** | Legitimate production hardening, intentionally out of POC scope. |

## Findings at a glance

| ID | Area | Severity | One-line |
|----|------|----------|----------|
| C-1 | `studentController.create` | Critical | Ownership forgeable via `req.body.parent_id`; inserts/validates columns not in schema. |
| C-2 | `registrationController.create` | Critical | Omits `first_class_date` → every registration fails (`NOT NULL` + RPC param). |
| C-3 | `authController.signup` | Critical | Writes nonexistent `password_hash` column → signup insert fails. |
| H-1 | `authController.signup` | High | Role hardcoded `parent`; no domain derivation → admin unreachable. |
| H-2 | `adminController.reviewRegistration` | High | Reject doesn't decrement `current_count` → capacity leak. |
| M-1 | `authController.setupPassword` | Medium | `setup-password` endpoint contradicts spec ("no setup-password step"). |
| M-2 | admin routes | Medium | `GET /admin/summary` (home counts) missing. |
| M-3 | admin routes | Medium | `GET /admin/query` (dynamic filtering) missing. |
| M-4 | `timeSlotController.listAvailable` | Medium | Ignores `date`; no next-available-date logic. |
| M-5 | all controllers / `index.js` | Medium | Raw DB error messages leaked to clients. |
| M-6 | `registrationController.create` | Medium | Duplicate-slot unique violation → opaque 500. |
| M-7 | `docs/architecture.md:161` | Medium | Dangling reference to a nonexistent `backend-report.md`. |

---

## Detailed findings

### C-1 — `studentController.create`: ownership bypass + schema mismatch

**Issue** — `server/src/controllers/studentController.js:7-33`. The handler reads `req.body.parent_id` and inserts it directly, and it validates/inserts `parent_name`, `student_email`, `student_phone`, `description` — none of which exist in `server/db/schema.sql`'s `students` table (only `parent_id, student_name, age, parent_email, parent_phone`). Two failures: (a) the Supabase insert errors out on unknown columns, so the endpoint never succeeds; (b) even if columns matched, `parent_id` is attacker-supplied — any authenticated parent can create a child under another parent's account (IDOR).

**Fix** — Set `parent_id = req.user.id` (from the verified JWT, available via `requireAuth`). Validate and insert exactly the four spec fields: `student_name` (req), `age` (req), `parent_email` (req), `parent_phone` (req). Drop all references to `parent_name`, `student_email`, `student_phone`, `description`.

**Why** — `architecture.md:161` states `parent_id` is set server-side from `auth.uid()` and the body is the four fields above. `routes/students.js:8` already enforces `requireRole('parent')`, so `req.user.id` is always the authenticated parent — trusting the body instead defeats that guard and the endpoint is currently 100% broken against the applied schema.

### C-2 — `registrationController.create`: `first_class_date` omitted

**Issue** — `server/src/controllers/registrationController.js:14-35`. The handler never reads or validates `first_class_date` and calls `supabase.rpc('register_with_capacity', { p_student_id, p_program_id, p_time_slot_id })` — missing `p_first_class_date`. `server/db/register_with_capacity.sql` now requires the `p_first_class_date date` parameter and inserts it into `registrations.first_class_date`, which is `NOT NULL` in `schema.sql`. Every registration call fails.

**Fix** — Require `first_class_date` in the request body (reject 400 if absent), and pass `p_first_class_date: first_class_date` in the RPC call.

**Why** — `architecture.md:162` and §5 `registrations` mandate `first_class_date` as a required form field and a `NOT NULL` column. This is the app's primary parent flow; it is currently dead.

### C-3 — `authController.signup`: writes nonexistent `password_hash`

**Issue** — `server/src/controllers/authController.js:28`. The `users` insert includes `password_hash: 'supabase_managed'`. `schema.sql`'s `users` table has no such column, so the insert fails; the handler then deletes the just-created auth user (`:34`) and returns 500. Signup is entirely broken.

**Fix** — Remove the `password_hash` field from the insert object.

**Why** — `architecture.md:185` explicitly states there is no app-side `password_hash` column — passwords are Supabase-managed. The column was removed from the finalized schema but the controller wasn't updated.

### H-1 — Role hardcoded; not derived from email domain

**Issue** — `server/src/controllers/authController.js:16` (`app_metadata: { role: 'parent' }`) and `:29` (`role: 'parent'` in the `users` insert). Role is always `parent`. There is no `@sc4k.ca` check anywhere. Admin users can never be created, so every `requireRole('admin')` route (`routes/admin.js:19`) is permanently unreachable.

**Fix** — Derive role from the email domain at signup: `const role = emailAddress.toLowerCase().endsWith('@sc4k.ca') ? 'admin' : 'parent';`. Use that single value for both `app_metadata.role` and the `users.role` insert.

**Why** — `architecture.md:13-18` defines exactly this: `@sc4k.ca` → `admin`, any other domain → `parent`, set server-side in `app_metadata` (clients can't alter it). `requireAuth` already reads `app_metadata.role` (`middleware/auth.js:18`), so the only missing piece is deriving and setting it. Without this the admin half of the product does not exist.

### H-2 — Rejection doesn't decrement `current_count`

**Issue** — `server/src/controllers/adminController.js:144-163` (`reviewRegistration`). It updates `status`, `reviewed_at`, `reviewed_by` but never touches `time_slots.current_count`. `current_count` is incremented on registration (pending + approved headcount). When a registration is rejected, the seat is never released.

**Fix** — When the status transitions to `rejected`, atomically decrement the associated slot's `current_count` (guard against double-decrement on repeated PATCH; ideally a small `reject_registration` RPC mirroring `register_with_capacity` so the status change + decrement are one transaction).

**Why** — `architecture.md:258` and `:276` state `current_count` is decremented on rejection. Without it, every rejected registration permanently consumes a seat; slots wrongly report 5/5 and block valid parents — a silent capacity leak that compounds over time.

### M-1 — `setup-password` endpoint contradicts the spec

**Issue** — `server/src/controllers/authController.js:66-80` and `server/src/routes/auth.js:9` expose `POST /auth/setup-password`.

**Fix** — Remove the route and the `setupPassword` handler (and its import).

**Why** — `architecture.md:13` explicitly states "no invite/setup-password step." It's dead, contradictory surface area that invites confusion and is untested against the single signup/login flow.

### M-2 — Missing `GET /admin/summary`

**Issue** — No handler/route for the admin home view. `routes/admin.js` has no `summary` route.

**Fix** — Add `GET /admin/summary` returning `{ enrolled_count, pending_count }` — enrolled = approved registrations (or distinct enrolled students), pending = `registrations` where `status = 'pending'`.

**Why** — `architecture.md:164` and §Admin Features (`:21`) require the home view to show currently-enrolled and pending counts. It's the admin landing screen's only data source.

### M-3 — Missing `GET /admin/query` (dynamic filtering)

**Issue** — No dynamic/combinable filter endpoint exists.

**Fix** — Add `GET /admin/query` accepting a small whitelist of combinable filters (program, teacher, location/in-person, online) and returning the joined rows. For POC, whitelisted query params over the existing joins is sufficient — no generic query builder.

**Why** — `architecture.md:174` and `:22` list dynamic combinable-axis filtering as a POC admin capability; the preset list views are documented as defaults, not the only views.

### M-4 — `timeSlotController.listAvailable` ignores `date`

**Issue** — `server/src/controllers/timeSlotController.js:4` reads only `program_id, mode, location_id`. The spec endpoint takes `date=` and supports next-available-date logic. Capacity filtering is also done in JS after fetch (`:23`) — acceptable at POC scale but unrelated to the date gap.

**Fix** — Accept the `date` query param; support returning slots for a given date and the "next available date(s)" needed by cascading selection.

**Why** — `architecture.md:160` defines `GET /time-slots?...&date=` and `:54` (cascading selection step 4) requires next-available-date before slot selection. The parent form's date step can't be driven without it.

### M-5 — Raw DB error messages leaked to clients

**Issue** — Every controller returns `res.status(500).json({ error: error.message })` on DB failure, and the global handler (`server/src/index.js:33`) returns `err.message`. Internal Postgres/Supabase messages reach clients.

**Fix** — Log the real error server-side; return a generic `{ error: 'Internal server error' }`. Keep specific mapped responses for known cases (RPC `P0001`/`P0002`, validation 400s).

**Why** — `architecture.md:75` calls for standard security posture. Leaking driver/SQL detail is needless information disclosure; cheap to fix even for a POC.

### M-6 — Duplicate-registration unique violation → opaque 500

**Issue** — `server/src/controllers/registrationController.js:37-41`. The `registrations` `UNIQUE (student_id, time_slot_id)` constraint surfaces as Postgres `23505`, which falls through to a generic 500.

**Fix** — Detect `error.code === '23505'` and return `409 { error: 'Student already registered for this time slot' }`.

**Why** — `architecture.md:275` defines that unique constraint specifically to prevent double-registration; the API should communicate it as a conflict, not a server error, so the client can show a sensible message.

### M-7 — Dangling doc reference

**Issue** — `docs/architecture.md:161` references "see backend-report.md C-1; fix deferred to code phase," but no `backend-report.md` exists in the repo.

**Fix** — Update that note to point at `server/report.md` (this file). The doc edit itself is deferred to the code phase alongside the C-1 fix.

**Why** — A spec that cites a nonexistent artifact misleads anyone onboarding from `architecture.md`.

---

## Deferred — acceptable for POC (documented, not blocking)

| Item | Location | Note |
|---|---|---|
| Wide-open CORS | `index.js:20` (`app.use(cors())`) | Fine for POC; restrict to the app origin before any non-POC exposure. |
| No rate limiting | `routes/auth.js` | Acceptable at 100 MAU; add basic limits on `/auth/*` before launch. |
| Weak validation | `adminController.js:3` email regex; `age`/time/enum checks ad-hoc | Tighten with a schema validator post-POC; current ad-hoc checks suffice to demo. |
| No pagination | admin list endpoints | Fine at spec scale (100 MAU); revisit when data grows. |
| Service-role client used for `signInWithPassword` | `authController.js:38` | Works for POC; a smell — prefer an anon client for user-facing auth later. |

## Suggested fix order (code phase)

1. **C-3** then **H-1** then **C-1**, **C-2** — restores signup and registration end-to-end (do C-3/H-1 together; both touch `signup`).
2. **H-2** — close the capacity leak (needs the reject RPC; touches DB layer).
3. **M-6**, **M-5** — small, low-risk error-handling hardening.
4. **M-2**, **M-3**, **M-4** — additive endpoints for the admin/parent feature gaps.
5. **M-1** — remove `setup-password`.
6. **M-7** — update the `architecture.md` reference once `server/report.md` is the agreed artifact.
