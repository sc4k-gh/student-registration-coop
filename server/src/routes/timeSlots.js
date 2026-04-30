import { supabase } from '../config/supabase.js';
import express from 'express';
const router = express.Router();

//List available slots with capacity info
router.get('/', async (req, res) => {
  if (!req.query.program_id || !req.query.mode) {
    return res.status(400).json({ error: 'program_id and mode are required' });
  }

  let query = supabase
    .from('time_slots')
    .select()
    .eq('program_id', req.query.program_id) //Filter to slots matching supplied program
    .eq('mode', req.query.mode) //Filter to slots using the supplied mode


  if (req.query.location_id) {
      //Filter to slots at the supplied location (SKIP IF OFFLINE)
      query = query.eq('location_id', req.query.location_id) 
    }

  const { data, error } = await query;

  if (error) {return res.status(500).json({ error: error.message })}

    // Filter for available slots (under max capacity)
    const availableSlots = data.filter(slot => slot.current_count < slot.max_capacity);
    res.json(availableSlots);
});

export default router; //Export routes