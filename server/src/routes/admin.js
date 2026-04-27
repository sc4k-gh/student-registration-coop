import { clerkMiddleware, clerkClient, requireAuth, getAuth } from '@clerk/express';
import { supabase } from '../config/supabase.js';
import express from 'express';
const router = express.Router();

//Every endpoint in this file requires the user to be authorized as an admin, otherwise 403 is returned
// FIX (architecture §4 "Middleware: Auth guard, Role guard, Validation"):
//   The empty middleware/auth.js and middleware/roleGuard.js files should hold
//   this logic. Right now every handler repeats the same `getAuth` + `auth.has`
//   block (8 copies). Implement a `requireRole('sc4k:admin')` middleware and
//   apply it once with `router.use(...)`. Same for parent routes.
// FIX: also inconsistent with auth.js which uses `permission: 'sc4k:admin'`
//   instead of `role: 'sc4k:admin'`. Pick one (Clerk treats them differently)
//   and use it everywhere.

//Students under a specific teacher, by day, with contact details
router.get('/teachers/:id/students', async (req, res) => {
  const auth = getAuth(req);
  if (!auth.has({role: 'sc4k:admin'})) {
    return res.status(403).send('Forbidden'); // Return 403 if user isn't authorized
  };
  const { data, error } = await supabase
    .from('time_slots')
    .select('id, teacher_id, registrations (student_id, students (*))') // Show students with all related
    .eq('teacher_id', req.params.id) // Results matching teacher id
    // FIX: comment says "Order results by day" but it orders by `id`. Change
    // to .order('day_of_week') (and probably .order('start_time') as a tiebreak)
    // to match the architecture's "Teacher → Students … on what days" view.
    .order('id', { ascending: false });
  if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)};
});

// FIX (architecture §4 endpoint table): the documented endpoint is
// `POST /admin/teachers`, not `/admin/teachers/create`. Rename to `/teachers`
// to match the docs (and REST conventions). Same drift potential elsewhere —
// audit the route paths against the architecture endpoint table.
//Add teacher
router.post('/teachers/create', async (req, res) => {
  const auth = getAuth(req);
  if (!auth.has({role: 'sc4k:admin'})) {
    return res.status(403).send('Forbidden')}; // Return 403 if user isn't authorized
  // FIX: no input validation. `name` is NOT NULL in the schema; if missing the
  // DB throws a 500 instead of a clean 400. Validate required fields (name)
  // and email format before insert. Apply the same pattern to every POST in
  // this file.
  // FIX: Supabase `.insert(...)` without `.select()` returns `data: null`.
  // The handler responds with `null`, so the client can't get the new id.
  // Add `.select().single()` after `.insert(...)`.
  const { data, error } = await supabase
    .from('teachers')
    .insert({
      'name': req.body.name,
      'email': req.body.email,
      'phone_number': req.body.phone_number
    });
  if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)};
});

//All students with program + parent info
router.get('/students', async (req, res) => {
  const auth = getAuth(req);
  if (!auth.has({role: 'sc4k:admin'})) {
    return res.status(403).send('Forbidden')}; // Return 403 if user isn't authorized
  const { data, error } = await supabase
    .from('students')
    .select('*, registrations (*, programs (*))') // Retrieve program, parent, and student information with a student id that matches request body
  if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)};
});

//Create program
router.post('/programs', async (req, res) => {
  const auth = getAuth(req);
  if (!auth.has({role: 'sc4k:admin'})) {
    return res.status(403).send('Forbidden')}; // Return 403 if user isn't authorized
  const { data, error } = await supabase
    .from('programs')
    .insert({
      'name': req.body.name,
      'level': req.body.level,
      'target_age': req.body.target_age,
      'description': req.body.description,
      'prerequisites': req.body.prerequisites,
      // FIX: `status` should not be client-controlled. Schema defaults it to
      // 'active'; accepting it from the body lets a caller create programs
      // straight to 'inactive' or any future enum value. Drop this field and
      // use a separate PATCH endpoint to deactivate.
      'status': req.body.status
    });
  if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)};
});

// FIX (missing endpoint): architecture §4 lists
//   `PATCH /admin/registrations/:id` — "Approve or reject a registration".
// This is the core admin workflow and is not implemented. Add a handler that
// updates `status` to 'approved' or 'rejected', sets `reviewed_at` = NOW()
// and `reviewed_by` = the admin's user id. Note that the schema's
// decrement_slot_count trigger only fires on transition to 'rejected', so
// approve/reject must go through this endpoint (not a generic UPDATE).
//Pending registrations queue
router.get('/registrations', async (req, res) => {
  const auth = getAuth(req);
  if (!auth.has({role: 'sc4k:admin'})) {
    return res.status(403).send('Forbidden')}; // Return 403 if user isn't authorized
  // FIX: queue view in architecture (§1 admin table) shows student name and
  // time-slot info — selecting `*` from registrations alone gives the admin
  // only foreign-key UUIDs. Expand the select to embed students(*) and
  // time_slots(*, programs(name)) so the UI doesn't need N+1 follow-up calls.
  const { data, error } = await supabase
    .from('registrations')
    .select()
    .eq('status', 'pending'); // Retrieve all registrations still marked pending
  if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)};
});

//Program detail with slot counts
router.get('/programs/:id', async (req, res) => {
  const auth = getAuth(req);
  if (!auth.has({role: 'sc4k:admin'})) {
    return res.status(403).send('Forbidden')}; // Return 403 if user isn't authorized
  const { data, error } = await supabase
    .from('programs')
    .select('*, time_slots (id, mode, teacher_id, day_of_week, max_capacity, current_count)')
    .eq('id', req.params.id); // Results matching given program id
  if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)};
});

//Create time slot
router.post('/time-slots', async (req, res) => {
  const auth = getAuth(req);
  if (!auth.has({role: 'sc4k:admin'})) {
    return res.status(403).send('Forbidden')}; // Return 403 if user isn't authorized
  const { data, error } = await supabase
    .from('time_slots')
      .insert({
      'program_id': req.body.program_id,
      'teacher_id': req.body.teacher_id,
      'location_id': req.body.location_id,
      'mode': req.body.mode,
      'day_of_week': req.body.day_of_week,
      'start_time': req.body.start_time,
      'end_time': req.body.end_time,
      'max_capacity': req.body.max_capacity,});
  if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)};
});

//All teachers with their courses and time slots
router.get('/teachers', async (req, res) => {
  const auth = getAuth(req);
  if (!auth.has({role: 'sc4k:admin'})) {
    return res.status(403).send('Forbidden')}; // Return 403 if user isn't authorized
  const { data, error } = await supabase
    .from('teachers')
    .select('*, time_slots (*, programs (*))')
  if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)};
});

export default router; //Export routes