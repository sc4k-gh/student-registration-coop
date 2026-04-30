import { clerkMiddleware, clerkClient } from '@clerk/express';
import { supabase } from '../config/supabase.js';
import express from 'express';
const router = express.Router();
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
// FIX ON LINE 11: startTransition is a frontend React import.
// This file is a backend Node server file.
// Frontend imports like React should not be used here
// (They cause unexpected problems).
// import { startTransition } from 'react';

router.use(requireAuth, requireRole('sc4k:admin'));

//Students under a specific teacher, by day, with contact details
router.get('/teachers/:id/students', async (req, res) => {
  const { data, error } = await supabase
    .from('time_slots')
    .select('id, teacher_id, registrations (student_id, students (*))') // Show students with all related
    .eq('teacher_id', req.params.id) // Results matching teacher id
    .order('day_of_week', { ascending: false });
  
  if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)};
});

//Add teacher
router.post('/teachers', async (req, res) => {
  if (!req.body.name) {return res.status(400).json({ error: 'Invalid input'})}; // Name must always be included, return 400 if not
  if (req.body.email && // Check for an email
    (req.body.email.search('@') == -1 || // Check for an @ symbol
    req.body.email.search('.') == -1 )) // Check for a period
     {return res.status(400).json({ error: 'Invalid input'})}; // If there is an email but one of the two above doesn't exist, return 400
  
  const { data, error } = await supabase
    .from('teachers')
    .insert({
      'name': req.body.name,
      'email': req.body.email,
      'phone_number': req.body.phone_number})
    .select()
    .single();
  
  if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)};
});

//All students with program + parent info
router.get('/students', async (req, res) => {
  const { data, error } = await supabase
    .from('students')
    .select('*, registrations (*, programs (*))'); // Retrieve program, parent, and student information with a student id that matches request body
  
  if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)};
});

//Create program
router.post('/programs', async (req, res) => {
  // If name, level, or target age are missing, return 400
  if (!req.body.name || !req.body.level || !req.body.target_age) 
    {return res.status(400).json({ error: 'Invalid input'})};
     // FIX ON LINE 67: Remove extra return. 
     // A return statement is already on line 62
     // Adding a second one here closes the function execution,
     // Makes the rest of the code unreachable.
     // {return res.status(400).json({ error: 'Invalid input'})};
  if (req.body.level != 'beginner' && req.body.level != 'intermediate' && req.body.level != 'advanced')
    {return res.status(400).json({ error: 'Invalid input'})};
  
  const { data, error } = await supabase
    .from('programs')
    .insert({
      'name': req.body.name,
      'level': req.body.level,
      'target_age': req.body.target_age,
      'description': req.body.description,
      'prerequisites': req.body.prerequisites,
      // FIX ON LINE 82: remove 'status': 'active'
      // Status is handled automatically (active)
      // No need to manually include it, remove the field.
      // 'status': 'active'
    })
    .select()
    .single();
  
  if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)};
});

//Update the status of a program
router.post('/programs/update', async (req, res) => {
  if (req.body.status != 'active' && req.body.status != 'inactive')
    {return res.status(400).json({ error: 'Invalid input'})};

  const { data, error } = await supabase
    .from('programs')
    .update({ status: req.body.status })
    // FIX ON LINE 102: Use req.params.id (identifies which registration to update).
    // req.body.id is a field value (e.g. status), not for selecting which record.
    // .eq('id', req.body.id) 
    .eq('id', req.params.id)
    .select()
    .single();
  
  if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)}; // Code to change the time slot count isn't needed, Supabase function decrement_slot_count handles it automatically without needing input
});

//Approve or reject a registration
// UPDATE: Endpoint should be PATCH, was originally POST (which is incorrect).
router.patch('/registrations/:id', async (req, res) => {
  if (req.body.status != 'pending' && req.body.status != 'approved' && req.body.status != 'rejected')
    {return res.status(400).json({ error: 'Invalid input'})};

  const { data, error } = await supabase
    .from('registrations')
    .update({
      'status': req.body.status,
      // FIX ON LINE 119: now() does not exist (it won't do anything).
      // Use the proper JavaScript standard for getting the current data.
      // 'reviewed_at': now(),
      'reviewed_at': new Date().toISOString(),
      // FIX: Logging incorrect ID.
      // req.body.id is the registration id.
      // use req.auth.userID to get the admin's Clerk ID.
      //'reviewed_by': req.body.id
      'reviewed_by': req.auth.userId
    })
    // FIX ON LINE 133: See line 102; same issue.
    .eq('id', req.params.id) // Patch a registration status matching the given ID
    .select()
    .single();

  if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)};
});

//Pending registrations queue
router.get('/registrations', async (req, res) => {
  const { data, error } = await supabase
    .from('registrations')
    .select('*, time_slots (*, students (*), programs (name))')
    .eq('status', 'pending'); // Retrieve all registrations still marked pending
  
  if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)};
});

//Program detail with slot counts
router.get('/programs/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('programs')
    .select('*, time_slots (id, mode, teacher_id, day_of_week, max_capacity, current_count)')
    .eq('id', req.params.id); // Results matching given program id
  
  if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)};
});

//Create time slot
router.post('/time-slots', async (req, res) => {
  // If program id, mode, day of week, start/end time, max capacity, or end count are missing, return 400
  if (
    !req.body.program_id || 
    !req.body.mode || 
    !req.body.day_of_week || 
    !req.body.start_time ||
    !req.body.end_time ||
    !req.body.max_capacity ||
    !req.body.current_count) 
      {return res.status(400).json({ error: 'Invalid input'})};
    
  const { data, error } = await supabase
    .from('time_slots')
      .insert({
      'program_id': req.body.program_id,
      'teacher_id': req.body.teacher_id,
      'location_id': req.body.location_id,
      'mode': req.body.mode,
      'day_of_week': req.body.day_of_week,
      'start_time': req.body.start_time,
      'end_time': req.body.end_time,
      // FIX ON LINE 185: added current_count to insert (was missing previously).
      'current_count': req.body.current_count,
      'max_capacity': req.body.max_capacity
    })
      .select()
      .single();
  
  if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)};
});

//All teachers with their courses and time slots
router.get('/teachers', async (req, res) => {
  const { data, error } = await supabase
    .from('teachers')
    .select('*, time_slots (*, programs (*))');
  
  if (error) {return res.status(500).json({ error: error.message })}
    else {res.json(data)};
});

export default router; //Export routes