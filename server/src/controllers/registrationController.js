import { supabase } from '../config/supabase.js';
import { isUuid } from '../utils/validation.js';

export const listMine = async (req, res) => {
  const { data, error } = await supabase
    .from('students')
    .select('*, registrations(*)')
    .eq('parent_id', req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const create = async (req, res) => {
  const { student_id, program_id, time_slot_id } = req.body ?? {};
  if (!student_id || !program_id || !time_slot_id) {
    return res.status(400).json({ error: 'student_id, program_id, and time_slot_id are required' });
  }
  if (!isUuid(student_id) || !isUuid(program_id) || !isUuid(time_slot_id)) {
    return res.status(400).json({ error: 'student_id, program_id, and time_slot_id must be uuids' });
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

  // program_id and time_slot_id arrive as independent values, and nothing downstream
  // ties them together — the RPC inserts both and no constraint relates
  // registrations.program_id to the slot's program. Without this check a registration
  // can name one program while consuming a seat in another program's slot.
  const { data: slot, error: slotErr } = await supabase
    .from('time_slots')
    .select('id, program_id')
    .eq('id', time_slot_id)
    .maybeSingle();

  if (slotErr) return res.status(500).json({ error: slotErr.message });
  if (!slot) return res.status(404).json({ error: 'Time slot not found' });
  if (slot.program_id !== program_id) {
    return res.status(400).json({ error: 'time_slot_id does not belong to program_id' });
  }

  const { data, error } = await supabase.rpc('register_with_capacity', {
    p_student_id: student_id,
    p_program_id: program_id,
    p_time_slot_id: time_slot_id,
  });

  if (error) {
    if (error.code === 'P0001') return res.status(409).json({ error: 'Time slot is full' });
    if (error.code === 'P0002') return res.status(404).json({ error: 'Time slot not found' });
    // uq_student_slot — the student is already registered for this time slot.
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Student is already registered for this time slot' });
    }
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
};
