import 'dotenv/config';
import express from 'express';
import jsonwebtoken from 'jsonwebtoken';
const app = express();
const port = 8000;
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);


//Route definitions
import programs from './routes/programs.js';
import auth from './routes/auth.js';
import locations from './routes/locations.js';
import admin from './routes/admin.js';
import timeSlots from './routes/timeSlots.js';
import registrations from './routes/registrations.js';

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
app.use('/registrations', registrations)

//Listen on port 8000
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
