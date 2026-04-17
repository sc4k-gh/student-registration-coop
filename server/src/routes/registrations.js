import { supabase } from '../config/supabase.js';
import express from 'express';
const router = express.Router();


//View own registrations + status PARENT
router.get('/my', async (req, res) => {
  const auth = getAuth(req)
  if (!auth.has({ permission: 'sc4k:parent' })) {return res.status(403).send('Forbidden')} // Check for admin permissions in Clerk, error if not admin
    const { data, error } = await supabase
      .from('registrations')
      .select()
      .eq('student_id', req.query.student_id); // Retrieve registration information with a student id that matches request body
    if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)};
});

//Submit a registration, PARENT
router.post('/', async (req, res) => {
  const auth = getAuth(req)
  if (!auth.has({ permission: 'sc4k:parent' })) {return res.status(403).send('Forbidden')} // Check for admin permissions in Clerk, error if not admin
    const { data, error } = await supabase
      .from('registrations')
      .insert({
        'student_id': req.body.student_id,
        'program_id': req.body.program_id,
        'time_slot_id': req.body.time_slot_id,
      });    
    if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)};
});

export default router; //Export routes