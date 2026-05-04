import { supabase } from '../config/supabase.js';

export const listAvailable = async (req, res) => {
  const { program_id, mode, location_id } = req.query;

  if (!program_id || !mode) {
    return res.status(400).json({ error: 'program_id and mode are required' });
  }

  let query = supabase
    .from('time_slots')
    .select()
    .eq('program_id', program_id)
    .eq('mode', mode);

  if (location_id) {
    query = query.eq('location_id', location_id);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  const available = data.filter((s) => s.current_count < s.max_capacity);
  res.json(available);
};
