import { getAuth } from '@clerk/express';
import { supabase } from '../config/supabase.js';
import express from 'express';
const router = express.Router();

//View own registrations + status
router.get('/my', async (req, res) => {
  const auth = getAuth(req);
  
  // Step 1: Check parent role from metadata
  const role = auth.sessionClaims?.metadata?.role;
  if (role !== 'sc4k:parent') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Step 2: Get local user ID from Clerk metadata
  const localUserId = auth.sessionClaims?.metadata?.localUserId;
  if (!localUserId) {
    return res.status(400).json({ error: 'No local user ID found' });
  }

  // Step 3: Find all students belonging to this parent, with their registrations
  const { data, error } = await supabase
    .from('students')
    .select('*, registrations(*)')
    .eq('parent_id', localUserId);

  if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)};
});

//Submit a registration
router.post('/', async (req, res) => {
  const auth = getAuth(req);

  // Step 1: Check parent role from metadata
  const role = auth.sessionClaims?.metadata?.role;
  if (role !== 'sc4k:parent') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Step 2: Validate required fields
  if (!req.body.program_id || !req.body.student_id || !req.body.time_slot_id) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  // Step 3: Get local user ID from Clerk metadata
  const localUserId = auth.sessionClaims?.metadata?.localUserId;
  if (!localUserId) {
    return res.status(400).json({ error: 'No local user ID found' });
  }

  // Step 4: Verify the student belongs to this parent
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('id, parent_id')
    .eq('id', req.body.student_id)
    .eq('parent_id', localUserId)
    .single();

  if (studentError || !student) {
    return res.status(403).json({ error: 'Forbidden - student does not belong to you' });
  }

  // Step 5: Submit the registration
  const { data, error } = await supabase
    .from('registrations')
    .insert({
      'student_id': req.body.student_id,
      'program_id': req.body.program_id,
      'time_slot_id': req.body.time_slot_id,
      'status': 'pending'
    })
    .select()
    .single();

  if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)};
});

export default router; //Export routes