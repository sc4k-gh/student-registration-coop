import { supabase } from '../config/supabase.js';
import { pageRange, PAGE_SIZE } from '../utils/validation.js';

export const listMine = async (req, res) => {
  const { page, from, to } = pageRange(req.query.page);
  const { data, error } = await supabase
    .from('students')
    .select('*, registrations(*, programs(*), time_slots(*))')
    .eq('parent_id', req.user.id)
    .range(from, to);

  if (error) {
    console.error('registrations.listMine failed', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
  res.json({ data, page, page_size: PAGE_SIZE });
};

export const create = async (req, res) => {
  const { student_id, program_id, time_slot_id, first_class_date } = req.body ?? {};
  if (!student_id || !program_id || !time_slot_id || !first_class_date) {
    return res.status(400).json({
      error: 'student_id, program_id, time_slot_id, and first_class_date are required',
    });
  }

  const { data: student, error: studentErr } = await supabase
    .from('students')
    .select('id, parent_id')
    .eq('id', student_id)
    .eq('parent_id', req.user.id)
    .maybeSingle();

  if (studentErr) {
    console.error('registrations.create student lookup failed', studentErr);
    return res.status(500).json({ error: 'Internal server error' });
  }
  if (!student) {
    return res.status(403).json({ error: 'Forbidden — student does not belong to you' });
  }

  const { data, error } = await supabase.rpc('register_with_capacity', {
    p_student_id: student_id,
    p_program_id: program_id,
    p_time_slot_id: time_slot_id,
    p_first_class_date: first_class_date,
  });

  if (error) {
    if (error.code === 'P0001') return res.status(409).json({ error: 'Time slot is full' });
    if (error.code === 'P0002') return res.status(404).json({ error: 'Time slot not found' });
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Student already registered for this time slot' });
    }
    console.error('registrations.create rpc failed', error);
    return res.status(500).json({ error: 'Internal server error' });
  }

  res.status(201).json(data);
};
