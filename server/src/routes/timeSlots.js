import 'dotenv/config';
const express = require('express');
const jsonwebtoken = require('jsonwebtoken');
const app = express();
const port = 8000;
const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const router = express.Router();

//TBA: Restrictions on what information the user recieves
//List available slots with capacity info WIP
router.get('/?program_id=&mode=&location_id=', async (req, res) => {
  const { data, error } = await supabase
    .from('time-slots')
    .select()
    .eq('program_id', req.params.id); // Retrieve programs and timeslots matching given ID
  res.send(data);
});

module.exports = router; //Export routes