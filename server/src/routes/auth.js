import { clerkMiddleware, clerkClient, getAuth} from '@clerk/express';
import { supabase } from '../config/supabase.js';
import express from 'express';
import jsonwebtoken from 'jsonwebtoken';
const router = express.Router();

//Login (returns JWT)
router.post('/login', async (req, res) => {
  // FIX (architecture §4): the login contract is `{ email, password } -> JWT`.
  // This handler accepts `userId` (a Clerk-internal id the client doesn't
  // know) and never resolves an email to a userId. Either accept email and
  // call `clerkClient.users.getUserList({ emailAddress: [...] })`, or — since
  // Clerk's mobile SDK normally handles login client-side — drop this
  // endpoint and have the client sign in with Clerk directly.
  const userId = req.body.userId
  const password = req.body.password
  const verified = await clerkClient.users.verifyPassword({userId, password});
  if (!verified) {
    return res.status(403).send('Forbidden'); // Return 403 if user isn't authorized
  };
  // FIX (bug, runtime crash): `sessionId` and `template` are undefined here.
  // This line will throw a ReferenceError on every successful login attempt.
  // Need to (a) create a session via `clerkClient.sessions.createSession`,
  // capture its id, and (b) pass a real JWT template name (e.g. 'sc4k').
  const response = await clerkClient.sessions.getToken(sessionId, template); // Add template name after official Clerk is created
  res.json({response});
});

//Admin sets password on first login (email must be pre-seeded)
router.post('/setup-password', async (req, res) => {
  const auth = getAuth(req);
  // FIX: inconsistent with admin.js which uses `role: 'sc4k:admin'`. Pick one
  // (Clerk distinguishes roles vs permissions) and align across the codebase.
  if (!auth.has({permission: 'sc4k:admin'})) {
    return res.status(403).send('Forbidden'); // Return 403 if user isn't authorized
  };
  //Update password of current session's user with request body
  const params = {password:req.body.password};
  // FIX: no try/catch — `updateUser` throws on Clerk API errors (weak password,
  // network) and there's no error handler middleware, so the request hangs.
  const response = await clerkClient.users.updateUser(req.auth.userId, params);
    // FIX (bug): `err` is undefined (should be the rejected promise's value) and
    // `error.message` would also reference an undefined `error`. This whole
    // block is dead code — `updateUser` either returns or throws, it doesn't
    // surface an `err` variable. Wrap the call in try/catch instead.
    if (err) {return res.status(500).json({ error: error.message })}
      else {res.json(response)};
});

//May need to be changed depending on what parameters are set for user accounts through Clerk
//Parent sign-up
// FIX (architecture §1 deviation + security): docs say "Parent: sign-up / login
// flow" — parents pick their own password at sign-up. The setup-password flow
// is *admin-only* (because admins are pre-seeded). This handler uses a hard-
// coded 'unsetpassword' for everyone, which (a) is a known-string credential
// for every freshly created parent until they happen to call setup-password,
// (b) lets anyone log in as a new parent before they do, and (c) doesn't even
// gate setup-password by parent role. Accept `password` in the request body
// and pass it to createUser; remove the placeholder.
// FIX: also no validation that emailAddress is present / well-formed; no
// duplicate-email handling (Clerk throws 422 — surface a 409 to the client).
// FIX: no corresponding `users` row is inserted in Postgres. The schema
// (database/schema.sql) has a `users` table referenced by students.parent_id;
// without inserting here, every later students-insert will fail the FK.
router.post('/signup', async (req, res) => {
  await clerkClient.users.createUser({
    emailAddress: [req.body.emailAddress],
    password: 'unsetpassword', // Set to placeholder until setup-password is used
  });
  res.status(200).json({success: true});
});

export default router; //Export routes