import './config/SupabaseClient.js'
//Parent sign-up
router.post('/signup', async (req, res) => {
  const { data, error } = await supabase.auth.signUp({
    email: req.body.email,
    password: req.body.password,
    name: req.body.name,
    role: req.body.role,
    phone_number: req.body.phone_number,
    created_at: req.body.created_at,
    updated_at: req.body.updated_at
  });
});

export default router; //Export routes