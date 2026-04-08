import './config/SupabaseClient.js'
//List all locations, ANY
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('locations')
    .select();
  res.send(data);
});

export default router; //Export routes