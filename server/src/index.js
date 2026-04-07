// FIX: 'import' is ES Module syntax. Everything else in this project uses 'require' (CommonJS).
// Mixing both styles causes Node.js to crash. Change this line to: require('dotenv/config')
import 'dotenv/config';
const express = require('express');
// FIX: jsonwebtoken is never called or used anywhere in this file. It's just sitting here unused.
const jsonwebtoken = require('jsonwebtoken');
const app = express();
const port = 8000;
// FIX: The Supabase client is being set up here AND copy-pasted into every single route file.
// It should only be created once in config/supabase.js, then imported where it's needed.
// Duplicating this in every file means if you change the URL or key, you have to update every file manually.
const { createClient } = require("@supabase/supabase-js");
const supabaseUrl = process.env.DATABASE_URL;
// FIX: SUPABASE_PUBLISHABLE_DEFAULT_KEY is being used like a variable name, but it was never
// declared anywhere with const/let/var. Node.js will throw "ReferenceError: SUPABASE_PUBLISHABLE_DEFAULT_KEY
// is not defined" and the server won't start. The key should come from your .env file:
// Change to: process.env.SUPABASE_KEY
const supabaseKey = SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
// FIX: This router is created but never used or exported anywhere. It's just taking up space.
const router = express.Router();

// FIX: app.use(express.json()) is missing. Without it, req.body will always be undefined,
// meaning every POST and PATCH endpoint that reads req.body will silently receive nothing.
// Add this line: app.use(express.json())

//Route definitions
// FIX: This file lives at src/index.js, so the routes folder is at ./routes/programs — not ./src/routes/programs.
// All 6 require() paths below have this same wrong prefix. Change './src/routes/...' to './routes/...'
const programs = require('./src/routes/programs')
const auth = require('./src/routes/auth')
const locations = require('./src/routes/locations')
const admin = require('./src/routes/admin')
// FIX: The actual file is named timeSlots.js, not time-slots.js. This require will fail with
// "Cannot find module './src/routes/time-slots'" because no such file exists.
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
// FIX: The architecture doc defines this endpoint as /time-slots (with a hyphen), not /timeSlots.
// The mobile app will send requests to /time-slots and get a 404 because this doesn't match.
app.use('/timeSlots', timeSlots)
// FIX: The path is missing the leading '/'. Express requires paths to start with a slash.
// 'registrations' will never match any incoming request. Change to '/registrations'.
app.use('registrations', registrations)

//Listen on port 8000
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
// FIX: app.use() with no arguments is invalid and will throw an error when the server starts.
app.use()
