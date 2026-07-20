export const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

// Postgres rejects a malformed uuid with error 22P02, which surfaces as a 500.
// Check the shape first so callers get a 400 instead.
export const isUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
