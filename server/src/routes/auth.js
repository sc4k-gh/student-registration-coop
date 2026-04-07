import 'dotenv/config';
import express from 'express';
import jsonwebtoken from 'jsonwebtoken';
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const router = express.Router();

//Add parent
router.get('/signup', async (req, res) => {
  const { data, error } = await supabase.auth.signUp(
  {
    email: req.body.email,
    password_hash: req.body.password, // !! WIP !!
    options: {
      data: {
        name: req.body.name,
        role: 'parent',
        phone_number: req.body.phone_number,
        created_at: req.body.created_at,
        updated_at: req.body.updated_at
      }
    }
  }
)
});

export default router; //Export routes