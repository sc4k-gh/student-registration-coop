import { clerkMiddleware, clerkClient, getAuth} from '@clerk/express';
import { supabase } from '../config/supabase.js';
import express from 'express';
import jsonwebtoken from 'jsonwebtoken';
const router = express.Router();

//Login (returns JWT)
router.post('/login', async (req, res) => {
  const userId = req.body.userId
  const password = req.body.password
  const verified = await clerkClient.users.verifyPassword({userId, password});
  if (!verified) {
    return res.status(403).send('Forbidden'); // Return 403 if user isn't authorized
  };
  // Use the `getToken()` method to generate a token from a template, and send as json
  const response = await clerkClient.sessions.getToken(sessionId, template); // Add template name after official Clerk is created
  res.json({response});
});

//Admin sets password on first login (email must be pre-seeded)
router.post('/setup-password', async (req, res) => {
  const auth = getAuth(req);
  if (!auth.has({permission: 'sc4k:admin'})) {
    return res.status(403).send('Forbidden'); // Return 403 if user isn't authorized
  };
  //Update password of current session's user with request body
  const params = {password:req.body.password};
  const response = await clerkClient.users.updateUser(req.auth.userId, params);
    if (err) {return res.status(500).json({ error: error.message })}
      else {res.json(response)};
});

//May need to be changed depending on what parameters are set for user accounts through Clerk
//Parent sign-up
router.post('/signup', async (req, res) => {
  await clerkClient.users.createUser({
    emailAddress: [req.body.emailAddress],
    password: 'unsetpassword', // Set to placeholder until setup-password is used
  });
  res.status(200).json({success: true});
});

export default router; //Export routes