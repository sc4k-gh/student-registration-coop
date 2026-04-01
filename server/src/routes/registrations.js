//View own registrations + status
app.get('/registrations/my', async (req, res) => {
  const { data, error } = await supabase
    .from('registrations')
    .select()
    .eq('student_id', req.body.student_id); // Retrieve registration information with a student id that matches request body
  res.send(data);
});

//Submit a registration, PARENT
app.post('/registrations', async (req, res) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (data.user.role == 'parent') {
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
  }
});