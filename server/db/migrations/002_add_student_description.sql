-- Keep the live students table aligned with database/schema.sql.
-- Apply once in the Supabase SQL editor or with psql.
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS description TEXT;

NOTIFY pgrst, 'reload schema';