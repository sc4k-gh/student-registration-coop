const postgres = require('postgres');

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString, { ssl: 'require' });

module.exports = sql;

async function testConnection() {
  try {
    await sql`SELECT 1`;
    console.log('Connected to Supabase DB!');
  } catch (err) {
    console.error('Connection failed:', err.message);
  } finally {
    // FIX: sql.end() permanently shuts down the connection pool.
    // After this runs, no other part of the app can make database queries.
    // Remove this line — the pool should stay open for the lifetime of the server.
    await sql.end();
  }
}

// FIX: This file uses the 'postgres' driver (raw SQL), but every route file uses
// the Supabase JS client (supabase.from(...), supabase.auth.getUser(), etc.).
// These are two different ways to talk to the database. Pick one and use it everywhere.
// Since the routes already use the Supabase JS client, this config should export a
// Supabase client using createClient() from '@supabase/supabase-js' instead.
testConnection();
