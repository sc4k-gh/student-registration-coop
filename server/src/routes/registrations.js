import { clerkMiddleware, clerkClient, requireAuth, getAuth } from '@clerk/express';
import { supabase } from '../config/supabase.js';
import express from 'express';
const router = express.Router();

//Every endpoint in this file requires the user to be authorized as a parent, otherwise 403 is returned

//View own registrations + status
router.get('/my', async (req, res) => {
  const auth = getAuth(req)
  if (!auth.has({permission: 'sc4k:parent'})) {
    return res.status(403).send('Forbidden')}; // Return 403 if user isn't authorized
  const { data, error } = await supabase
    .from('registrations')
    .select()
    .eq('student_id', auth.student_id); // Retrieve registration information with a student id that matches request body
  if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)};
});

//Submit a registration
router.post('/', async (req, res) => {
  const auth = getAuth(req)
  if (!auth.has({permission: 'sc4k:parent'})) {
    return res.status(403).send('Forbidden')}; // Return 403 if user isn't authorized
  const { data, error } = await supabase
    .from('registrations')
    .insert({
      'student_id': auth.body.student_id,
      'program_id': req.body.program_id,
      'time_slot_id': req.body.time_slot_id,
    });    
  if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)};
});

export default router; //Export routes