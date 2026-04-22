import { clerkMiddleware, clerkClient, requireAuth, getAuth } from '@clerk/express'
import { supabase } from '../config/supabase.js';
import express from 'express';
// import hasPermission from './registrations.js'
// This code imports from itself (which doesn't work).
// Instead, create the function in this file without importing.
// Same as in admin.js, except now the permission is for parents, not admins.
const router = express.Router();

// Use `getAuth()` to protect a route based on authorization status
const hasPermission = (req, res, next) => {
  const auth = getAuth(req)
  if (!auth.has({ permission: 'sc4k:parent' })) { 
    return res.status(403).send('Forbidden') // Handle if the user is not authorized
  }
  return next()
}

//View own registrations + status PARENT
router.get('/my', requireAuth(), hasPermission, async (req, res) => {
    const { data, error } = await supabase
      .from('registrations')
      .select()
      // FIX ON LINE 17: previously .eq('student_id', auth.student_id);
      // auth is never defined as a paremeter in this function; replace with req
      // Alternatively, have auth be defined in the function if necessary.
      .eq('student_id', req.student_id); // Retrieve registration information with a student id that matches request body
    if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)};
});

//Submit a registration, PARENT
router.post('/', requireAuth(), hasPermission, async (req, res) => {
    const { data, error } = await supabase
      .from('registrations')
      .insert({
        // FIX ON LINE 31: previously 'student_id': req.body.student_id,
        // Same issue as before. either have auth be replaced with res,
        // Or define it here if auth is specifically needed over req.
        'student_id': req.body.student_id,
        'program_id': req.body.program_id,
        'time_slot_id': req.body.time_slot_id,
      });    
    if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)};
});

export default router; //Export routes