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

//List all locations, ANY
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('locations')
    .select();
  res.send(data);
});

module.exports = router; //Export routes