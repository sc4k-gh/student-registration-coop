import { supabase } from '../config/supabase.js';

export const listMine = async (req, res) => {
  const { data, error } = await supabase
    .from('students')
    .select('*, registrations(*, programs(*), time_slots(*))')
    .eq('parent_id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const create = async (req, res) => {
  const { student_id, program_id, time_slot_id } = req.body ?? {};
  if (!student_id || !program_id || !time_slot_id) {
    return res.status(400).json({ error: 'student_id, program_id, and time_slot_id are required' });
  }

  const { data: student, error: studentErr } = await supabase
    .from('students')
    .select('id, parent_id')
    .eq('id', student_id)
    .eq('parent_id', req.user.id)
    .maybeSingle();

  if (studentErr) return res.status(500).json({ error: studentErr.message });
  if (!student) {
    return res.status(403).json({ error: 'Forbidden — student does not belong to you' });
  }

  const { data, error } = await supabase.rpc('register_with_capacity', {
    p_student_id: student_id,
    p_program_id: program_id,
    p_time_slot_id: time_slot_id,
  });

  if (error) {
    if (error.code === 'P0001') return res.status(409).json({ error: 'Time slot is full' });
    if (error.code === 'P0002') return res.status(404).json({ error: 'Time slot not found' });
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
};
