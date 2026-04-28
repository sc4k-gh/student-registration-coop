import { clerkMiddleware, clerkClient } from '@clerk/express';
import { supabase } from '../config/supabase.js';
import express from 'express';
const router = express.Router();
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';

router.use(requireAuth, requireRole('sc4k:admin'));

//Students under a specific teacher, by day, with contact details
router.get('/teachers/:id/students', async (req, res) => {
  const { data, error } = await supabase
    .from('time_slots')
    .select('id, teacher_id, registrations (student_id, students (*))') // Show students with all related
    .eq('teacher_id', req.params.id) // Results matching teacher id
    .order('day_of_week', { ascending: false });
  if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)};
});

//Add teacher
router.post('/teachers', async (req, res) => {
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
  const { data, error } = await supabase
    .from('students')
    .select('*, registrations (*, programs (*))') // Retrieve program, parent, and student information with a student id that matches request body
  if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)};
});

//Create program
router.post('/programs', async (req, res) => {
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

//Approve or reject a registration
router.post('/registrations/:id', async (req, res) => {
    const { data, error } = await supabase
      .from('registrations')
      .update({
        'status': req.body.status,
        'reviewed_at': now(),
        'reviewed_by': req.body.id
      })
      .eq('id', req.params.id); // Patch a registration status matching the given ID
    if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)}; // Code to change the time slot count isn't needed, Supabase function decrement_slot_count handles it automatically without needing input
});

//Pending registrations queue
router.get('/registrations', async (req, res) => {
  const { data, error } = await supabase
    .from('registrations')
    .select('*, time_slots (*, students (*) programs (name))')
    .eq('status', 'pending'); // Retrieve all registrations still marked pending
  if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)};
});

//Program detail with slot counts
router.get('/programs/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('programs')
    .select('*, time_slots (id, mode, teacher_id, day_of_week, max_capacity, current_count)')
    .eq('id', req.params.id); // Results matching given program id
  if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)};
});

//Create time slot
router.post('/time-slots', async (req, res) => {
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
  const { data, error } = await supabase
    .from('teachers')
    .select('*, time_slots (*, programs (*))')
  if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)};
});

export default router; //Export routes