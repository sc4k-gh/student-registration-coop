-- Atomic registration review: status change + capacity release on reject.
-- Apply once in the Supabase SQL editor, AFTER schema.sql.
-- Decrements time_slots.current_count only on the first transition into
-- 'rejected' (idempotent on repeated calls).
create or replace function public.review_registration(
  p_registration_id uuid,
  p_status registration_status,
  p_reviewer_id uuid
) returns registrations
language plpgsql
security definer
as $$
declare
  v_reg registrations%rowtype;
begin
  select * into v_reg from registrations where id = p_registration_id for update;
  if not found then
    raise exception 'registration not found' using errcode = 'P0002';
  end if;

  if p_status = 'rejected' and v_reg.status <> 'rejected' then
    update time_slots
       set current_count = greatest(current_count - 1, 0),
           updated_at = now()
     where id = v_reg.time_slot_id;
  end if;

  update registrations
     set status      = p_status,
         reviewed_at = now(),
         reviewed_by = p_reviewer_id,
         updated_at  = now()
   where id = p_registration_id
  returning * into v_reg;

  return v_reg;
end;
$$;
