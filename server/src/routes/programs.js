//List all programs, ANY
app.get('/programs', async (req, res) => {
  const { data, error } = await supabase
    .from('programs')
    .select();
  res.send(data);
});