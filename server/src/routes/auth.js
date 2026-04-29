import { clerkMiddleware, clerkClient, getAuth} from '@clerk/express';
import { supabase } from '../config/supabase.js';
import express from 'express';
import jsonwebtoken from 'jsonwebtoken';
const router = express.Router();

//Admin sets password on first login (email must be pre-seeded)
router.post('/setup-password', async (req, res) => {
  const auth = getAuth(req);
  if (!auth.has({role: 'sc4k:admin'})) {
    return res.status(403).send('Forbidden'); // Return 403 if user isn't authorized
  };
  //Update password of current session's user with request body
  const params = {password:req.body.password};

  try {
    const response = await clerkClient.users.updateUser(
      req.auth.userId, 
      { password: req.body.password }
    );
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


//Parent sign-up
router.post('/signup', async (req, res) => {
  // Validate email and password; check if they are present and well-formed
  if (!req.body.emailAddress || !req.body.password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  await clerkClient.users.createUser({
    emailAddress: [req.body.emailAddress],
    password: req.body.password,
  });
  res.status(200).json({success: true});
});

export default router; //Export routes