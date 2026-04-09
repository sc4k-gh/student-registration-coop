import './config/SupabaseClient.js'
//Parent sign-up
router.post('/signup', async (req, res) => {
  const { data, error } = await supabase.auth.signUp({
    email: req.body.email,
    // FIX: The Supabase signUp field for the password is called 'password', not 'password_hash'.
    // 'password_hash' is what your database stores after hashing — Supabase handles the hashing
    // internally. Passing 'password_hash' here means the password field is empty and signup will fail.
    password_hash: req.body.password, // !! WIP !!
    options: {
      data: {
        name: req.body.name,
        role: 'parent',
        phone_number: req.body.phone_number,
        created_at: req.body.created_at,
        updated_at: req.body.updated_at
      }
    }
  }
)
// FIX: Add a response here, e.g.: res.json({ data, error })
});

export default router; //Export routes