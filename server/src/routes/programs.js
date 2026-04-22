import { supabase } from '../config/supabase.js';
import express from 'express';
const router = express.Router();

//List all programs, ANY
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('programs')
    // FIX: Previously .select();
    // Select needs to fetch both programs and time slot data.
    // Without this fetch, time slot info on the course page can never be read.
    .select('*, time_slots (*)');
  if (error) {return res.status(500).json({ error: error.message })}
  else {res.json(data)};
});

export default router; //Export routes