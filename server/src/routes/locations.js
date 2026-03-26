const express = require('express');
const app = express();
const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = 'https://tezxtqtabsfxdavbmgpp.supabase.co';
const supabaseKey = 'sb_publishable_np5n2nhgYZGBDxq_QZdoUg_p8Ck5NRT';
const supabase = createClient(supabaseUrl, supabaseKey);

//Get a list of all current locations and associated information
app.get('/locations', async (req, res) => {
    const { data, error } = await supabase
        .from('locations')
        .select();
  res.send(data);
})