// FIX: 'import' is ES Module syntax. Everything else in this project uses 'require' (CommonJS).
// Mixing both styles causes Node.js to crash. Change this line to: require('dotenv/config')
import 'dotenv/config';
import express from 'express';
const app = express();
const port = 8000;
import './config/SupabaseClient.js'
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
// FIX: The architecture doc defines this endpoint as /time-slots (with a hyphen), not /timeSlots.
// The mobile app will send requests to /time-slots and get a 404 because this doesn't match.
app.use('/timeSlots', timeSlots)
app.use('/registrations', registrations)

//Listen on port 8000
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
