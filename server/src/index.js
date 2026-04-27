import 'dotenv/config';
// FIX (architecture deviation): docs/architecture.md §3 specifies "Supabase Auth" with
// the Node API validating Supabase JWTs via middleware. This implementation uses Clerk
// instead. Either update the architecture doc to reflect the Clerk decision, or replace
// Clerk with Supabase Auth + a JWT-validating middleware.
import { clerkMiddleware, clerkClient, requireAuth, getAuth } from '@clerk/express';
import { supabase } from './config/supabase.js';
import express from 'express';
const app = express();
// FIX: env var name is conventionally uppercase (PORT). `process.env.port` will be
// undefined and `app.listen(undefined)` picks a random port — breaks deployments on
// Render where PORT is injected.
const port = process.env.port;
app.use(express.json());
// FIX: missing `cors` middleware. Mobile/web client on a different origin will be
// blocked. `cors` is already a dependency in package.json — wire it up here.
app.use(clerkMiddleware());
// FIX: missing global error handler. Async route handlers that throw (see auth.js
// where `sessionId`/`template`/`err` are undefined) will crash the process or hang
// the request. Add a 4-arg error middleware after the routes.

//Route definitions
import programs from './routes/programs.js';
import auth from './routes/auth.js';
import locations from './routes/locations.js';
import admin from './routes/admin.js';
import timeSlots from './routes/timeSlots.js';
import registrations from './routes/registrations.js';

//Routes
app.use('/programs', programs);
app.use('/auth', auth);
app.use('/locations', locations);
app.use('/admin', admin);
app.use('/time-slots', timeSlots);
app.use('/registrations', registrations);
// FIX: missing `/students` route. The client (registration_form.js handleSubmit)
// POSTs to `/students` to create a child record before submitting a registration,
// but no router is mounted here and no file exists for it. Either create
// routes/students.js (POST to insert into `students` for the authenticated parent)
// or change the registration flow to take student fields inline.

//Listen on port 8000
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});