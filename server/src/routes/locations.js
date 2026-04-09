import { supabase } from '../config/supabase.js';
import express from 'express';
const router = express.Router();
//List all locations, ANY
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('locations')
    .select();
  if (error) {return res.status(500).json({ error: error.message })}
  else {res.send(data)};
});

export default router; //Export routes