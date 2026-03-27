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
})

//List all programs
app.get('/programs', async (req, res) => {
    const { data, error } = await supabase
        .from('programs')
        .select();
  res.send(data);
})

//List all locations
app.get('/locations', async (req, res) => {
    const { data, error } = await supabase
        .from('locations')
        .select();
  res.send(data);
})

//WIP
//Pending registrations queue (TBA: Auth) 
app.get('/admin/registrations', async (req, res) => {
    const { data, error } = await supabase
        .from('registrations')
        .select();
  res.send(data);
})

//WIP
//Pending registrations queue (TBA: Auth) 
app.get('/admin/students', async (req, res) => {
    const { data, error } = await supabase
        .from('students')
        .select('students, registrations')
        .eq('student_id', req.params.student_id) // Retrieve registration and student information with a student id that matches
  res.send(data);
})

//Update a given registration status, set it to the body of the request
app.patch('/admin/registrations/:id', async (req, res) => {
    const { data, error } = await supabase
        .from('registrations')
        .update( {'status': req.body} )
        .eq('id', req.params.id)
  res.send(data);
})