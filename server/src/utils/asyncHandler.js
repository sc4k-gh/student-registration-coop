// Express 4 does not forward rejected promises from async handlers to the error
// middleware — the request just hangs. Wrap every async handler with this.
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
