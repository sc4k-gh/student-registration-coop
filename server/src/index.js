import 'dotenv/config'
const express = require('express');
const jsonwebtoken = require('jsonwebtoken');
const app = express();
const port = 8000;
const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

//ENDPOINTS TO BE ADDED
// /auth/login
// /auth/setup-password
// /admin/teachers/:id/students

//Listen on port 8000
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});