import { supabase } from '../config/supabase.js';
import express from 'express';
const router = express.Router();
//Should be fully functional now
//Students under a specific teacher, by day, with contact details
router.get('/teachers/:id/students', async (req, res) => {
  const { data, error } = await supabase
    .from('time_slots')
    .select('id, teacher_id, registrations (student_id, students (*))')
    .eq('teacher_id', req.params.id)
    .order('id', { ascending: false });
  if (error) {return res.status(500).json({ error: error.message })}
  else {res.send(data)};
});

//Add teacher, ADMIN
router.post('/teachers', async (req, res) => {
  const { data, error } = await supabase
    .from('teachers')
    .insert({
      'name': req.query.name,
      'email': req.query.email,
      'phone_number': req.query.phone_number});
  if (error) {return res.status(500).json({ error: error.message })}
  else {res.send(data)};
});

//All students with program + parent info, ADMIN
router.get('/students', async (req, res) => {
  const { data, error } = await supabase
    .from('students')
    // Fix on line 35: Previously .select('*, programs(*, users(*))')
    // This code uses query path students -> programs -> users (which is incorrect).
    // Correct path, as mentioned in architecture docs, is students -> registrations -> programs.
    .select('*, registrations (*, programs (*))')
  if (error) {return res.status(500).json({ error: error.message })}
  else {res.send(data)};
});

//Create program, ADMIN
router.post('/programs', async (req, res) => {
  const { data, error } = await supabase
    .from('programs')
    .insert({
      'name': req.body.name,
      'level': req.body.level,
      'target_age': req.body.target_age,
      'description': req.body.description,
      'prerequisites': req.body.prerequisites,
      'status': req.body.status});
  if (error) {return res.status(500).json({ error: error.message })}
  else {res.send(data)};
});


//Program detail with slot counts ADMIN
router.get('/programs/:id', async (req, res) => {
  const { data: { user } } = await supabase.auth.getUser(); // Gets the current user details
  if (user.role == 'admin') {
    const { data, error } = await supabase
      .from('programs')
      .select()
      .eq('id', req.params.id); // Retrieve program information with an id that matches request body
    data.slotcount = (data.max_capacity - data.current_count) // Set slotcount property to the max capacity of the program - current registrations
    if (error) {return res.status(500).json({ error: error.message })}
    else {res.send(data)};
  }
});

//Pending registrations queue, ADMIN
router.get('/registrations', async (req, res) => {
  const { data, error } = await supabase
    .from('registrations')
    .select()
    .eq('status', 'pending'); // Retrieve all registrations still marked pending
  if (error) {return res.status(500).json({ error: error.message })}
  else {res.send(data)};
});

//Still WIP
//Approve or reject a registration, ADMIN
router.patch('/registrations/:id', async (req, res) => {
  let decrement = 0
  if (req.query.status == 'rejected') {decrement = 1}
  else {decrement = -1};
  const { data1, error1 } = await supabase
    .from('registrations')
    .update( {
      'status': req.query.status,
    } )
    .eq('time_slot_id', req.params.id); // Patch a registration matching the given ID
    if (error1) {return res.status(500).json({ error1: error1.message })}
  const { data2, error2 } = await supabase
    .from('time_slots')
    .update( {
      'current_count': ('current_count' - 'decrement')
    } )
    .eq('id', req.params.id); // Patch a registration matching the given ID
  if (error2) {return res.status(500).json({ error2: error2.message })}
  else {res.send(data1)};
});


//Create time slot, ADMIN
router.post('/time-slots', async (req, res) => {
  const { data: { user } } = await supabase.auth.getUser(); // Gets the current user details
  if (user.role == 'admin') {
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
        'max_capacity': req.body.max_capacity,});
      if (error) {return res.status(500).json({ error: error.message })}
      else {res.send(data)};
    }
});

//New endpoint: GET	/admin/teachers (missing from original code)
//All teachers with their courses and time slots, ADMIN
router.get('/teachers', async (req, res) => {
  const { data, error } = await supabase
    .from('teachers')
    .select('*, time_slots (*, programs (*))')
  if (error) {return res.status(500).json({ error: error.message })}
  else {res.send(data)};
});

export default router; //Export routes
