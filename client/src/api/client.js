const express = require('express');
const app = express();
const port = 8000;
const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = 'https://tezxtqtabsfxdavbmgpp.supabase.co';
const supabaseKey = 'sb_publishable_np5n2nhgYZGBDxq_QZdoUg_p8Ck5NRT';
const supabase = createClient(supabaseUrl, supabaseKey);
const jsonwebtoken = require('jsonwebtoken'); // Currently unused but will likely be used later

//Listen on port 8000
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

//TBA: Auth)
//List all programs, ANY
app.get('/programs', async (req, res) => {
    const { data, error } = await supabase
        .from('programs')
        .select();
  res.send(data);
});

//List all locations, ANY
app.get('/locations', async (req, res) => {
    const { data, error } = await supabase
        .from('locations')
        .select();
  res.send(data);
});

//Pending registrations queue, ADMIN
app.get('/admin/registrations', async (req, res) => {
    const { data, error } = await supabase
        .from('registrations')
        .select()
        .eq('status', 'pending'); // Retrieve all registrations still marked pending
  res.send(data);
});

//View own registrations + status
app.get('/admin/registrations', async (req, res) => {
    const { data, error } = await supabase
        .from('registrations')
        .select()
        .eq('student_id', req.body.student_id); // Retrieve registration information with a student id that matches request body
  res.send(data);
});

//TBA: Parent info + fix programs
//All students with program + parent info, ADMIN
app.get('/admin/students', async (req, res) => {
    const { data, error } = await supabase
        .from('students')
        .select('students, programs')
        .eq('student_id', req.body.student_id); // Retrieve program and student information with a student id that matches request body
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

//Create time slot, ADMIN
app.post('/admin/time-slots', async (req, res) => {
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
});

//Submit a registration, PARENT
app.post('/registrations', async (req, res) => {
    const { data, error } = await supabase
        .from('registrations')
        .insert({
          'id': req.body.id,
          'student_id': req.body.student_id,
          'program_id': req.body.program_id,
          'time_slot_id': req.body.time_slot_id,
          'status': req.body.status,
          'submitted_at': req.body.submitted_at,
          'reviewed_at': req.body.reviewed_at,
          'reviewed_by': req.body.reviewed_by,
          'created_at': req.body.created_at,
          'updated_at': req.body.updated_at});
  res.send(data);
});

//TBA: Slot counts
//Program detail with slot counts
app.get('/admin/programs/:id', async (req, res) => {
    const { data, error } = await supabase
        .from('programs')
        .select()
        .eq('student_id', req.params.student_id); // Retrieve program information with a student id that matches request body
  res.send(data);
});