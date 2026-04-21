import { clerkMiddleware, clerkClient, requireAuth, getAuth } from '@clerk/express'
import { supabase } from '../config/supabase.js';
import 'dotenv/config';
import express from 'express';
const app = express();
/* Note: Port 8081 is used by Expo's Metro bundler by default.
When the backend uses this port as well, it leads to conflicts while attemtpting
to test both the frontend and backend at the same time.
*/
const port = 8000; // Old backend port; changed from 8081 to avoid conflicts with Expo.  
app.use(express.json());
app.use(clerkMiddleware());

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

//Listen on port 8000
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});