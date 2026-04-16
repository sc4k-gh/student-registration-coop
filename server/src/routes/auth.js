import { supabase } from '../config/supabase.js';
import express from 'express';
import { clerkMiddleware, clerkClient, requireAuth, getAuth } from '@clerk/express'
import jsonwebtoken from 'jsonwebtoken';
const router = express.Router();

//Login (returns JWT)
router.post('/login', (req, res) => {
    const user = {
        id: req.body.id,
        username: req.body.username,
        email: req.body.email
    };
    jsonwebtoken.sign({ user }, process.env.CLERK_SECRET_KEY, { expiresIn: '24h' }, (err, token) => {
        if (err) {return res.status(500).json({ error: error.message })}
        else {res.json(data)};
    });
});

//Parent sign-up
router.post('/signup', async (req, res) => {
  const { data, error } = await supabase.auth.signUp({
    email: req.body.email,
    password: req.body.password,
    options: {
      data: {
        name: req.body.name,
        role: 'parent',
        phone_number: req.body.phone_number,
      }
    }
  }
)
if (error) {return res.status(500).json({ error: error.message })}
  else {res.json(data)};
});

export default router; //Export routes