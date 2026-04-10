import { supabase } from '../config/supabase.js';
import express from 'express';
const router = express.Router();


//View own registrations + status
router.get('/my', async (req, res) => {
  const { data, error } = await supabase
    .from('registrations')
    .select()
    .eq('student_id', req.query.student_id); // Retrieve registration information with a student id that matches request body
  if (error) {return res.status(500).json({ error: error.message })}
  else {res.send(data)};
});

//Submit a registration, PARENT
router.post('/', async (req, res) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user.role == 'parent') {
    const { data, error } = await supabase
      .from('registrations')
      .insert({
        'student_id': req.query.student_id,
        'program_id': req.query.program_id,
        'time_slot_id': req.query.time_slot_id,
      });    
    if (error) {return res.status(500).json({ error: error.message })}
    else {res.send(data)};
  }
});

export default router; //Export routes