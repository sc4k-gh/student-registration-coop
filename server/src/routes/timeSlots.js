//TBA: Restrictions on what information the user recieves
//List available slots with capacity info WIP
app.get('/time-slots?program_id=&mode=&location_id=', async (req, res) => {
  const { data, error } = await supabase
    .from('time-slots')
    .select()
    .eq('program_id', req.params.id); // Retrieve programs and timeslots matching given ID
  res.send(data);
});