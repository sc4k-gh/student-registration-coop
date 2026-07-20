-- Atomic registration: capacity check + insert.
-- The counter itself is owned by trg_registration_insert (see database/schema.sql);
-- this function must NOT increment current_count or it will be counted twice.
-- Apply once in the Supabase SQL editor.
create or replace function public.register_with_capacity(
  p_student_id uuid,
  p_program_id uuid,
  p_time_slot_id uuid
) returns registrations
language plpgsql
security definer
as $$
declare
  v_slot time_slots%rowtype;
  v_row  registrations%rowtype;
begin
  select * into v_slot from time_slots where id = p_time_slot_id for update;
  if not found then
    raise exception 'time slot not found' using errcode = 'P0002';
  end if;
  if v_slot.current_count >= v_slot.max_capacity then
    raise exception 'time slot full' using errcode = 'P0001';
  end if;

  insert into registrations (student_id, program_id, time_slot_id, status)
  values (p_student_id, p_program_id, p_time_slot_id, 'pending')
  returning * into v_row;

  return v_row;
end;
$$;
