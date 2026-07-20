import { isUuid } from '../utils/validation.js';

// Postgres rejects a malformed uuid with 22P02, which the error handler turns into
// a 500. Reject the bad shape at the route instead.
export const validateUuidParam = (param) => (req, res, next) => {
  if (!isUuid(req.params[param])) {
    return res.status(400).json({ error: `${param} must be a uuid` });
  }
  next();
};
