import { clerkMiddleware, clerkClient, requireAuth, getAuth } from '@clerk/express'
import { supabase } from '../config/supabase.js';
import express from 'express';
import jsonwebtoken from 'jsonwebtoken';
const router = express.Router();

//Missing a template, will not work properly currently
//Login (returns JWT)
router.post('/login', (req, res) => {
  const auth = getAuth(req)
  if (!auth.has({ permission: 'sc4k:admin' })) { 
    return res.status(403).send('Forbidden') // Handle if the user is not authorized
  }
  const sessionId = req.auth.sessionId
  // Protect the route from unauthenticated users
  if (!sessionId) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  // Use the `getToken()` method to generate a token from a template
  const token = await clerkClient.sessions.getToken(sessionId, template) // Add template name after official Clerk is created
  res.json({ token })
});

//Admin sets password on first login (email must be pre-seeded)
router.post('/setup-password', requireAuth(), hasPermission, (req, res) => {
  const auth = getAuth(req)
  if (!auth.has({ permission: 'sc4k:admin' })) { 
    return res.status(403).send('Forbidden') // Handle if the user is not authorized
  };
  const user = {
    id: req.body.id,
    username: req.body.username,
    password: req.body.password
  };
  jsonwebtoken.sign({ user }, process.env.CLERK_SECRET_KEY, { expiresIn: '24h' }, (err, token) => {
    if (err) {return res.status(500).json({ error: error.message })}
      else {res.json(data)};
  });
});

//May need to be changed depending on what parameters are set for user accounts
//Parent sign-up
router.post('/signup', async (req, res) => {
  await clerkClient.users.createUser({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    emailAddress: [req.body.emailAddress],
    password: req.body.password,
  });
  res.status(200).json({ success: true })
});


export default router; //Export routes