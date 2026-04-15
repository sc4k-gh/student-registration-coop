import { supabase } from '../config/supabase.js';
import express from 'express';
const router = express.Router();

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
    .select('*, registrations (*, programs (*))') // Retrieve program, parent, and student information with a student id that matches request body
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

//Approve or reject a registration, ADMIN
router.post('/registrations/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('registrations')
    .update({'status': req.query.status})
    .eq('id', req.params.id); // Patch a registration status matching the given ID
  if (error) {return res.status(500).json({ error: error.message })}
  else {res.send(data)}; // Code to change the time slot count isn't needed, Supabase function decrement_slot_count handles it automatically without needing input
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

//All teachers with their courses and time slots, ADMIN
router.get('/teachers', async (req, res) => {
  const { data, error } = await supabase
    .from('teachers')
    .select('*, time_slots (*, programs (*))')
  if (error) {return res.status(500).json({ error: error.message })}
  else {res.send(data)};
});

export default router; //Export routes
