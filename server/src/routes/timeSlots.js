import { supabase } from '../config/supabase.js';
import express from 'express';
const router = express.Router();

//List available slots with capacity info
router.get('/', async (req, res) => {
  // FIX: no validation on `program_id` / `mode`. If the client omits either,
  // PostgREST sees `eq.undefined` which it rejects with 400 — return a clean
  // 400 "program_id and mode are required" before hitting the DB.
  let query = supabase
    .from('time_slots')
    .select()
    .eq('program_id', req.query.program_id) //Filter to slots matching supplied program
    .eq('mode', req.query.mode) //Filter to slots using the supplied mode
    // FIX (bug): Supabase's `.lt(column, value)` compares the column to a
    // literal value, not to another column. `.lt('current_count',
    // 'max_capacity')` compares numbers to the string "max_capacity" and will
    // either error or always match. Use a Postgres view / RPC, or fetch the
    // rows and filter in JS, or expose a generated `is_available` column.
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