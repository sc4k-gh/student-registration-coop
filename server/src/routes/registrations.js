import { clerkMiddleware, clerkClient } from '@clerk/express';
import { supabase } from '../config/supabase.js';

import express from 'express';

const router = express.Router();

//Every endpoint in this file requires the user to be authorized as a parent, otherwise 403 is returned

//View own registrations + status
router.get('/my', async (req, res) => {
  const auth = getAuth(req);
  if (!auth.has({role: 'sc4k:parent'})) {
    return res.status(403).send('Forbidden')}; // Return 403 if user isn't authorized
  // FIX (bug): `auth.student_id` does not exist. `getAuth()` returns Clerk
  // auth state — { userId, sessionId, has, ... } — never `student_id`. A
  // parent owns *many* students, so this should: (1) look up the parent's
  // local users.id from auth.userId (or store the mapping in Clerk public
  // metadata), (2) find all students where `parent_id = users.id`, (3) return
  // registrations whose student_id is in that list. As written this filter is
  // `eq('student_id', undefined)` which selects everything (or errors).
  const { data, error } = await supabase
    .from('registrations')
    .select()
    .eq('student_id', req.body.student_id); // Retrieve registration information with a student id that matches request body
  if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)};
});

//Submit a registration
router.post('/', async (req, res) => {
  const auth = getAuth(req);
  if (!auth.has({role: 'sc4k:parent'})) {
    return res.status(403).send('Forbidden')}; // Return 403 if user isn't authorized
  // FIX (security / IDOR): the handler never verifies that
  // `req.body.student_id` belongs to the authenticated parent. A parent could
  // submit a registration for any other parent's child by guessing a UUID.
  // Before inserting, SELECT students WHERE id = student_id AND parent_id =
  // <this parent's users.id> and 403 if not found.
  // FIX (architecture §2 "Capacity checks must be atomic"): no capacity check
  // here. The schema's CHECK constraint (current_count <= max_capacity)
  // combined with the AFTER-INSERT trigger will throw a constraint violation
  // when a slot fills, which surfaces to the client as a generic 500. Wrap
  // insert + count in a Postgres function (or RPC) and return a clean 409
  // "slot full". Even better, hold a row-level lock on the time_slot during
  // the check to prevent the 5/5 race.
  const { data, error } = await supabase
  //WIP
    .from('registrations')
    .select('*, students (*)')
    .eq('id', req.body.student_id)
    .eq('parent_id', auth.userId)
    .insert({
      'student_id': req.body.student_id,
      'program_id': req.body.program_id,
      'time_slot_id': req.body.time_slot_id,
    });
  if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)};
});

export default router; //Export routes