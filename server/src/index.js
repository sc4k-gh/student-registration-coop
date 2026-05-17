import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import programs from './routes/programs.js';
import auth from './routes/auth.js';
import locations from './routes/locations.js';
import admin from './routes/admin.js';
import timeSlots from './routes/timeSlots.js';
import registrations from './routes/registrations.js';
import students from './routes/students.js';

const port = process.env.PORT;
if (!port) {
  throw new Error('PORT is required');
}

export const app = express();

// CORS is browser-only; the native Expo app doesn't need it. Re-enable for
// Expo web or a future browser admin UI.
// app.use(
//   cors({
//     origin: process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()) ?? false,
//     credentials: true,
//   }),
// );
app.use(express.json());

app.use('/auth', auth);
app.use('/programs', programs);
app.use('/locations', locations);
app.use('/time-slots', timeSlots);
app.use('/registrations', registrations);
app.use('/admin', admin);
app.use('/students', students);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const entry = process.argv[1]?.replace(/\\/g, '/');
const isMain = entry && import.meta.url.endsWith(entry);

if (isMain) {
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}
