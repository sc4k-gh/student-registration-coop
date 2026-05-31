-- Atomic registration review: status change + reviewer stamp.
-- current_count is decremented by trg_registration_update_or_delete (schema.sql)
-- when status transitions into 'rejected'; do NOT decrement here or it will
-- double-count.
-- Apply once in the Supabase SQL editor, AFTER schema.sql.
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
