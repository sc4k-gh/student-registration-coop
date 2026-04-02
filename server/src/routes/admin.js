import 'dotenv/config';
const express = require('express');
const jsonwebtoken = require('jsonwebtoken');
const app = express();
const port = 8000;
const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const router = express.Router();

//Add teacher, ADMIN
app.post('/admin/teachers', async (req, res) => {
  const { data, error } = await supabase
    .from('teachers')
    .insert({
      'id': req.body.id,
      'name': req.body.name,
      'email': req.body.email,
      'phone_number': req.body.phone_number,
      'created_at': req.body.created_at,
      'updated_at': req.body.updated_at});
  res.send(data);
});

//TBA: Parent info + fix programs
//All students with program + parent info, ADMIN
app.get('/admin/students', async (req, res) => {
  const { data, error } = await supabase
    .from('students')
    .select('students, programs (), users ()') // Retrieve program, parent, and student information with a student id that matches request body
  res.send(data);
});

//Create program, ADMIN
app.post('/admin/programs', async (req, res) => {
  const { data, error } = await supabase
    .from('programs')
    .insert({
      'id': req.body.id,
      'name': req.body.name,
      'level': req.body.email,
      'target_age': req.body.phone_number,
      'description': req.body.created_at,
      'prerequisites': req.body.prerequisites,
      'status': req.body.status,
      'created_at': req.body.created_at,
      'updated_at': req.body.updated_at});
  res.send(data);
});

//Program detail with slot counts ADMIN
app.get('/admin/programs/:id', async (req, res) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (data.user.role == 'parent') {
    const { data, error } = await supabase
      .from('programs')
      .select()
      .eq('id', req.params.id); // Retrieve program information with an id that matches request body
    data.slotcount = (max_capacity - current_count) // Set slotcount property to the max capacity of the program - current registrations
    res.send(data);
  }
});

//Pending registrations queue, ADMIN
app.get('/admin/registrations', async (req, res) => {
  const { data, error } = await supabase
    .from('registrations')
    .select()
    .eq('status', 'pending'); // Retrieve all registrations still marked pending
  res.send(data);
});

//Approve or reject a registration, ADMIN
app.patch('/admin/registrations/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('registrations')
    .update( {'status': req.body.status} )
    .eq('id', req.params.id); // Patch a registration matching the given ID
  res.send(data);
});

//Create time slot, ADMIN
app.post('/admin/time-slots', async (req, res) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (data.user.role == 'parent') {
    const { data, error } = await supabase
      .from('programs')
      .insert({
        'id': req.body.id,
        'program_id': req.body.program_id,
        'teacher_id': req.body.teacher_id,
        'location_id': req.body.location_id,
        'mode': req.body.mode,
        'day_of_week': req.body.day_of_week,
        'start_time': req.body.start_time,
        'end_time': req.body.end_time,
        'max_capacity': req.body.max_capacity,
        'current_count': req.body.current_count,
        'created_at': req.body.created_at,
        'updated_at': req.body.updated_at});
    res.send(data);
    }
});

module.exports = router; //Export routes