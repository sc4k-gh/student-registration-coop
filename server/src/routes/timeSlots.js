import { supabase } from '../config/supabase.js';
import express from 'express';
const router = express.Router();


//List available slots with capacity info
router.get('/', async (req, res) => {
  console.log('Time slots query received:', req.query);  
  const { data, error } = await supabase
    .from('time_slots')
    .select()
    .eq('program_id', req.query.program_id) //Filter to slots matching supplied program
    .eq('mode', req.query.mode) //Filter to slots using the supplied mode
    // .lt('current_count', 'max_capacity'); //Filter to slots under capacity

    // UPDATE: Created condition to only have location id be filtered only when we have an actual location.
    // When location_id = undefined (e.g. for all online courses), the filter causes an error.
    // As a result, filtering should be skipped when undefined.
    if (req.query.location_id) {
        query = query.eq('location_id', req.query.location_id) //Filter to slots at the supplied location
    }
  if (error) {return res.status(500).json({ error: error.message })}
  else {res.json(data)};
});

export default router; //Export routes