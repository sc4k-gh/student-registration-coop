-- Row Level Security policies.
-- Enable RLS on each table via the Supabase UI first (Table Editor → toggle RLS),
-- then paste this whole file into the SQL Editor and run.

-- Helper: read role from JWT app_metadata
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
$$;

-- USERS
create policy users_select_self_or_admin on users
  for select using (id = auth.uid() or public.is_admin());

create policy users_update_self on users
  for update using (id = auth.uid());

-- STUDENTS
create policy students_select on students
  for select using (parent_id = auth.uid() or public.is_admin());

create policy students_insert on students
  for insert with check (parent_id = auth.uid());

create policy students_update on students
  for update using (parent_id = auth.uid() or public.is_admin());

-- REGISTRATIONS (inserts go through register_with_capacity, which is security definer)
create policy registrations_select on registrations
  for select using (
    public.is_admin()
    or student_id in (select id from students where parent_id = auth.uid())
  );

create policy registrations_update_admin on registrations
  for update using (public.is_admin());

-- PROGRAMS / LOCATIONS / TEACHERS / TIME_SLOTS
-- read by any authenticated user; mutate by admin only
create policy programs_select on programs
  for select using (auth.role() = 'authenticated');
create policy programs_admin_write on programs
  for all using (public.is_admin()) with check (public.is_admin());

create policy locations_select on locations
  for select using (auth.role() = 'authenticated');
create policy locations_admin_write on locations
  for all using (public.is_admin()) with check (public.is_admin());

create policy teachers_select on teachers
  for select using (auth.role() = 'authenticated');
create policy teachers_admin_write on teachers
  for all using (public.is_admin()) with check (public.is_admin());

create policy time_slots_select on time_slots
  for select using (auth.role() = 'authenticated');
create policy time_slots_admin_write on time_slots
  for all using (public.is_admin()) with check (public.is_admin());
