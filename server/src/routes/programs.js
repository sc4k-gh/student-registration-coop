import './config/SupabaseClient.js'
//List all programs, ANY
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('programs')
    .select();
  res.send(data);
});

export default router; //Export routes