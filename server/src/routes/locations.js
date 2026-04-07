import 'dotenv/config';
import express from 'express';
import jsonwebtoken from 'jsonwebtoken';
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const router = express.Router();

//List all locations, ANY
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('locations')
    .select();
  res.send(data);
});

export default router; //Export routes