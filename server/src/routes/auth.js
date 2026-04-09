import { supabase } from '../config/supabase.js';
import express from 'express';
const router = express.Router();
//TBA: Clerk implementation

//Parent sign-up
router.post('/signup', async (req, res) => {
  const { data, error } = await supabase.auth.signUp({
    email: req.body.email,
    password: req.body.password, // !! WIP !!
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
if (error) {return res.status(500).json({ error: error.message })}
  else {res.send(data)};
});

export default router; //Export routes