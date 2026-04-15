import 'dotenv/config';
import express from 'express';
const app = express();
const port = 8000;

//Route definitions
import programs from './routes/programs.js';
import auth from './routes/auth.js';
import locations from './routes/locations.js';
import admin from './routes/admin.js';
import timeSlots from './routes/timeSlots.js';
import registrations from './routes/registrations.js';

// ENDPOINTS TO BE ADDED
// /auth/setup-password

// TODO
// Finish /auth/setup-password
// Finish Clerk implementation

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
