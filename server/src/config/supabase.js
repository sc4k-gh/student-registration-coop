import { createClient } from "@supabase/supabase-js";
// FIX: `DATABASE_URL` is the Postgres connection string (postgres://...), not the
// Supabase REST URL (https://<project>.supabase.co) that supabase-js needs. Rename
// to `SUPABASE_URL` (or read a separate env var) — passing a postgres:// URL here
// will fail every request.
const supabaseUrl = process.env.DATABASE_URL;
// FIX: server-side code should use the SERVICE ROLE key, not the publishable
// (anon) key. The publishable key is gated by RLS — without RLS policies that
// match the Clerk-authenticated user, all admin queries here will silently
// return empty arrays or be rejected. Use SUPABASE_SERVICE_ROLE_KEY and keep
// it server-only.
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);