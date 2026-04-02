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

//Route definitions
const programs = require('./src/routes/programs')
const auth = require('./src/routes/auth')
const locations = require('./src/routes/locations')
const admin = require('./src/routes/admin')
const timeSlots = require('./src/routes/time-slots')
const registrations = require('./src/routes/registrations')

//ENDPOINTS TO BE ADDED
// /auth/login
// /auth/setup-password
// /admin/teachers/:id/students

//Routes
app.use('/programs', programs)
app.use('/auth', auth)
app.use('/locations', locations)
app.use('/admin', admin)
app.use('/timeSlots', timeSlots)
app.use('registrations', registrations)

//Listen on port 8000
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
app.use()