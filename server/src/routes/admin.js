import './config/SupabaseClient.js'
//Add teacher, ADMIN
router.post('/teachers', async (req, res) => {
  const { data, error } = await supabase
    .from('teachers')
    .insert({
      'name': req.body.name,
      'email': req.body.email,
      'phone_number': req.body.phone_number,
      'created_at': req.body.created_at,
      'updated_at': req.body.updated_at});
  res.send(data);
});

//TBA: Parent info + fix programs
//All students with program + parent info, ADMIN
router.get('/students', async (req, res) => {
  const { data, error } = await supabase
    .from('students')
    .select('students, programs (), users ()') // Retrieve program, parent, and student information with a student id that matches request body
  if (error) return res.status(500).json({ error: error.message })
  else res.send(data);
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
  if (error) return res.status(500).json({ error: error.message })
  else res.send(data);
});

//Program detail with slot counts ADMIN
router.get('/programs/:id', async (req, res) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (data.user.role == 'admin') {
    const { data, error } = await supabase
      .from('programs')
      .select()
      .eq('id', req.params.id); // Retrieve program information with an id that matches request body
    // FIX: 'max_capacity' and 'current_count' are not variables in this scope.
    // They exist inside each row of the query result (e.g., data[0].max_capacity).
    // This line will throw "ReferenceError: max_capacity is not defined".
    data.slotcount = (data.max_capacity - data.current_count) // Set slotcount property to the max capacity of the program - current registrations
    if (error) return res.status(500).json({ error: error.message })
    else res.send(data);
  }
});

//Pending registrations queue, ADMIN
router.get('/registrations', async (req, res) => {
  const { data, error } = await supabase
    .from('registrations')
    .select()
    .eq('status', 'pending'); // Retrieve all registrations still marked pending
  if (error) return res.status(500).json({ error: error.message })
  else res.send(data);
});

// FIX: When a registration is rejected, current_count on time_slots should be decremented.
// This endpoint only updates the status but never adjusts the slot count, which will leave
// the slot showing as more full than it actually is.
//Approve or reject a registration, ADMIN
router.patch('/registrations/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('registrations')
    .update( {
      'status': req.body.status,
    } )
    .eq('id', req.params.id); // Patch a registration matching the given ID
  if (error) return res.status(500).json({ error: error.message })
  else res.send(data);
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
      if (error) return res.status(500).json({ error: error.message })
      else res.send(data);
    }
});

export default router; //Export routes