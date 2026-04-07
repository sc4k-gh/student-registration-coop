// FIX: The Supabase client should not be set up in every route file.
// Create it once in config/supabase.js and import it here: const supabase = require('../config/supabase')
// The same applies to dotenv — it only needs to be loaded once in index.js, not in every file.
import 'dotenv/config';
const express = require('express');
// FIX: jsonwebtoken is imported but never used in this file.
const jsonwebtoken = require('jsonwebtoken');
const app = express();
const port = 8000;
const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.DATABASE_URL;
// FIX: Same crash issue as index.js — SUPABASE_PUBLISHABLE_DEFAULT_KEY is not a declared variable.
// Change to: process.env.SUPABASE_KEY
const supabaseKey = SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
// FIX: app and router are created here but app is never mounted anywhere (it's a local copy, not
// the main app from index.js). All routes below should use 'router', not 'app'.
const router = express.Router();

// FIX: Signup creates new data on the server, so it must be POST, not GET.
// GET requests are for reading data. Change router.get to router.post.
// FIX: There is no res.send() or res.json() call in this handler.
// The server never sends a response back to the client, so the request will hang forever.
router.get('/signup', async (req, res) => {
  const { data, error } = await supabase.auth.signUp(
  {
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

module.exports = router; //Export routes
