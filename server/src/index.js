import 'dotenv/config';
// FIX (architecture deviation): docs/architecture.md §3 specifies "Supabase Auth" with
// the Node API validating Supabase JWTs via middleware. This implementation uses Clerk
// instead. Either update the architecture doc to reflect the Clerk decision, or replace
// Clerk with Supabase Auth + a JWT-validating middleware.
import { clerkMiddleware, clerkClient, requireAuth, getAuth } from '@clerk/express';
import { supabase } from './config/supabase.js';
import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT;
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

// Global error handler, catches all errors that happen in async route handlers.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});


//Route definitions
import programs from './routes/programs.js';
import auth from './routes/auth.js';
import locations from './routes/locations.js';
import admin from './routes/admin.js';
import timeSlots from './routes/timeSlots.js';
import registrations from './routes/registrations.js';
// TODO: add students.js file (waiting on mentor directions).
// Possibly add post /students for the registration form?
// (in order to have new students be created once a parent submits)
// Import below won't work until implemented, commented until then.
// import students from './routes/students.js'; */

//Routes
app.use('/programs', programs);
app.use('/auth', auth);
app.use('/locations', locations);
app.use('/admin', admin);
app.use('/time-slots', timeSlots);
app.use('/registrations', registrations);
// Commented until students.js is created
// app.use('/students', students);

//Listen on port 8000
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});