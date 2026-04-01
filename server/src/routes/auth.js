//Add parent
app.get('/auth/signup', async (req, res) => {
  const { data, error } = await supabase.auth.signUp(
  {
    email: req.body.email,
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
});