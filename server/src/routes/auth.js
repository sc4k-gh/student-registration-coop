import { clerkMiddleware, clerkClient, getAuth} from '@clerk/express';
import { supabase } from '../config/supabase.js';
import express from 'express';
const router = express.Router();

/*
  NOTE: New metadata strategy:
  We store both role and localUserId in Clerk's publicMetadata, which gets
  included in the JWT token automatically. This avoids extra DB lookups on
  every authenticated request to map Clerk user IDs to local Supabase user IDs.
 
  Inside Clerk publicMetadata, each user has:
  {
    role: 'sc4k:parent' OR 'sc4k:admin',
    localUserId: '<uuid-from-supabase-users-table>'
 * }
*/


//Admin sets password on first login (email must be pre-seeded)
router.post('/setup-password', async (req, res) => {
  const auth = getAuth(req);
  const role = auth.sessionClaims?.metadata?.role;
  if (role !== 'sc4k:admin') {
    return res.status(403).send('Forbidden');
  }
  //Update password of current session's user with request body
  const params = {password:req.body.password};

  try {
    const response = await clerkClient.users.updateUser(
      auth.userId, 
      { password: req.body.password }
    );
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


//Parent sign-up
router.post('/signup', async (req, res) => {
  // Validate email, password, and phone number; check if they are present and well-formed
  if (!req.body.emailAddress || !req.body.password || !req.body.phone) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  try {
    // Create Clerk user
    const clerkUser = await clerkClient.users.createUser({
      emailAddress: [req.body.emailAddress],
      password: req.body.password,
    });

    // Create local Supabase user
    // Mapping stored in Clerk metadata avoids DB lookup on every request.
    // This embeds the local Supabase user ID directly in Clerk's JWT token.
    const { data: localUser, error } = await supabase
      .from('users')
      .insert({
        email: req.body.emailAddress,
        password_hash: 'clerk_managed',
        role: 'parent',
        name: req.body.name || req.body.emailAddress,
        phone: req.body.phone
      })
      .select()
      .single();

    if (error) throw error;

    // Store mapping in Clerk metadata
    await clerkClient.users.updateUser(clerkUser.id, {
      publicMetadata: { 
        localUserId: localUser.id,
        role: 'sc4k:parent'
      }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; //Export routes