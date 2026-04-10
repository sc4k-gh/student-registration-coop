import { supabase } from '../config/supabase.js';
import express from 'express';
const router = express.Router();


// WIP, needs to be changed heavily and go through several different other tables to work properly
//Should go: Time slots with teacher id  => Registrations with that time slot id  => Students with that time slot?
//Students under a specific teacher, by day, with contact details
router.get('/teachers/:id/students', async (req, res) => {
  const { data, error } = await supabase
    .from('students')
    .select('*, teachers (*)')
    .eq('id', req.params.id);
  if (error) {return res.status(500).json({ error: error.message })}
  else {res.send(data)};
});

//Add teacher, ADMIN
router.post('/teachers', async (req, res) => {
  const { data, error } = await supabase
    .from('teachers')
    .insert({
      'name': req.body.name,
      'email': req.body.email,
      'phone_number': req.body.phone_number});
  if (error) {return res.status(500).json({ error: error.message })}
  else {res.send(data)};
});

//TBA: Parent info + fix programs
//All students with program + parent info, ADMIN
router.get('/students', async (req, res) => {
  const { data, error } = await supabase
    .from('students')
    .select('*, programs (*, users (*)') // Retrieve program, parent, and student information with a student id that matches request body
    // FIX: .eq needs to be changed so that it checks for student id only and goes from there
    .eq('id', req.params.id);
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
  const { data: { user } } = await supabase.auth.getUser();
  if (data.user.role == 'admin') {
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
  if (req.query.status == 'rejected') {const decrement = 1}
  else {const decrement = 0};
  const { data1, error1 } = await supabase
    .from('registrations')
    .update( {
      'status': req.query.status,
      //line where a value in a different table is decremented the decrement variable
    } )
    .eq('id', req.params.id); // Patch a registration matching the given ID
    if (error1) {return res.status(500).json({ error1: error1.message })}
  const { data2, error2 } = await supabase
    .from('time_slots')
    .update( {
      'current_count': ('current_count' - 'decrement')
      //line where a value in a different table is decremented the decrement variable
    } )
    .eq('id', req.params.id); // Patch a registration matching the given ID
  if (error2) {return res.status(500).json({ error2: error2.message })}
  else {res.send(data1)};
});


//Create time slot, ADMIN
router.post('/time-slots', async (req, res) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (data.user.role == 'admin') {
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

export default router; //Export routes
