// FIX: Same as other route files — Supabase and dotenv should not be set up here.
// Import from config/supabase.js instead. dotenv only needs to run once in index.js.
import 'dotenv/config';
const express = require('express');
// FIX: jsonwebtoken, app, and port are imported/created but never used in this file.
const jsonwebtoken = require('jsonwebtoken');
const app = express();
const port = 8000;
const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.DATABASE_URL;
// FIX: SUPABASE_PUBLISHABLE_DEFAULT_KEY is not a declared variable — server will crash on startup.
// Change to: process.env.SUPABASE_KEY
const supabaseKey = SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const router = express.Router();

// FIX: No error handling — if the query fails, the endpoint responds with null and a 200 OK.
// Add: if (error) return res.status(500).json({ error: error.message })
//List all locations, ANY
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('locations')
    .select();
  res.send(data);
});

module.exports = router; //Export routes
