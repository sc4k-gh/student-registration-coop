import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { pathToFileURL } from 'node:url';

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

app.use(cors());
app.use(express.json());

app.use('/auth', auth);
app.use('/programs', programs);
app.use('/locations', locations);
app.use('/time-slots', timeSlots);
app.use('/registrations', registrations);
app.use('/admin', admin);
app.use('/students', students);

app.use((err, _req, res, next) => {
  console.error(err);
  // A throw after the response started must go to Express's default handler,
  // which destroys the socket — writing again would throw ERR_HTTP_HEADERS_SENT.
  if (res.headersSent) return next(err);
  // err.message here is a raw Postgres/PostgREST string; it describes the schema
  // and query shape, so it stays server-side outside development.
  const body =
    process.env.NODE_ENV === 'development'
      ? { error: err.message }
      : { error: 'Internal server error' };
  res.status(500).json(body);
});

// pathToFileURL handles percent-encoding (spaces in the path) and drive letters,
// which a raw string comparison against argv[1] does not.
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}
