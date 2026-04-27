import { supabase } from '../config/supabase.js';
import express from 'express';
const router = express.Router();

//List available slots with capacity info
router.get('/', async (req, res) => {
  let query = supabase
    .from('time_slots')
    .select()
    .eq('program_id', req.query.program_id) //Filter to slots matching supplied program
    .eq('mode', req.query.mode) //Filter to slots using the supplied mode
    .lt('current_count', 'max_capacity'); //Filter to slots under capacity

  if (req.query.location_id) {
      //Filter to slots at the supplied location (SKIP IF OFFLINE)
      query = query.eq('location_id', req.query.location_id) 
    }

  const { data, error } = await query;

  if (error) {return res.status(500).json({ error: error.message })}
  else {res.json(data)};
});

export default router; //Export routes