// FIX: Same as other route files — Supabase and dotenv should not be set up here.
// Import from config/supabase.js instead.
import 'dotenv/config';
const express = require('express');
// FIX: jsonwebtoken is imported but never used in this file.
const jsonwebtoken = require('jsonwebtoken');
// FIX: app and port are created but never used. Routes must use 'router', not 'app'.
const app = express();
const port = 8000;
const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.DATABASE_URL;
// FIX: SUPABASE_PUBLISHABLE_DEFAULT_KEY is not a declared variable — server will crash on startup.
// Change to: process.env.SUPABASE_KEY
const supabaseKey = SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const router = express.Router();

//TBA: Restrictions on what information the user recieves
// FIX: Query string parameters (?program_id=&mode=&location_id=) are NOT part of the route path.
// Express will try to match the literal string '/?program_id=&mode=&location_id=' as a URL pattern
// and it will never match any real request. The route path should just be '/'.
// Read the filters using req.query instead: req.query.program_id, req.query.mode, req.query.location_id
//List available slots with capacity info WIP
router.get('/?program_id=&mode=&location_id=', async (req, res) => {
  const { data, error } = await supabase
    // FIX: The database table is named 'time_slots' (with an underscore), not 'time-slots' (with a hyphen).
    // Supabase will return an error saying the table doesn't exist.
    .from('time-slots')
    .select()
    // FIX: There is no ':id' parameter in this route, so req.params.id will always be undefined.
    // The filter should use req.query.program_id (from the query string), not req.params.id.
    // Also missing filters for 'mode' and 'location_id' from the query string.
    // Also missing a capacity filter — full slots (current_count >= max_capacity) should not be returned.
    .eq('program_id', req.params.id); // Retrieve programs and timeslots matching given ID
  res.send(data);
});

module.exports = router; //Export routes
