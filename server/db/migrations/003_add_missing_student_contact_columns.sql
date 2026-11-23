-- Align the live students table with the registration API and database/schema.sql.
-- Keep this additive for databases that may already contain student rows.
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS student_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS student_phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS parent_name VARCHAR(255);

UPDATE public.students AS students
SET parent_name = users.name
FROM public.users AS users
WHERE students.parent_id = users.id
  AND students.parent_name IS NULL;

ALTER TABLE public.students
  ALTER COLUMN parent_name SET NOT NULL;

NOTIFY pgrst, 'reload schema';