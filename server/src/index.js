import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import programs from './routes/programs.js';
import auth from './routes/auth.js';
import locations from './routes/locations.js';
import admin from './routes/admin.js';
import timeSlots from './routes/timeSlots.js';
import registrations from './routes/registrations.js';
// TODO: /students route is owned by another contributor.
// import students from './routes/students.js';

const port = process.env.PORT;
if (!port) {
  throw new Error('PORT is required');
}

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', auth);
app.use('/programs', programs);
app.use('/locations', locations);
app.use('/time-slots', timeSlots);
app.use('/registrations', registrations);
app.use('/admin', admin);
// app.use('/students', students);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

const entry = process.argv[1]?.replace(/\\/g, '/');
const isMain = entry && import.meta.url.endsWith(entry);

if (isMain) {
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}
