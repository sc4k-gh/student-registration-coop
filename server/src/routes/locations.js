//List all locations, ANY
app.get('/locations', async (req, res) => {
  const { data, error } = await supabase
    .from('locations')
    .select();
  res.send(data);
});