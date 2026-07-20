import { supabase } from '../config/supabase.js';
import { isUuid } from '../utils/validation.js';

const MODES = ['online', 'in-person'];

export const listAvailable = async (req, res) => {
  const { program_id, mode, location_id } = req.query;

  if (!program_id || !mode) {
    return res.status(400).json({ error: 'program_id and mode are required' });
  }
  if (!isUuid(program_id)) {
    return res.status(400).json({ error: 'program_id must be a uuid' });
  }
  if (!MODES.includes(mode)) {
    return res.status(400).json({ error: `mode must be ${MODES.join(' or ')}` });
  }
  if (location_id && !isUuid(location_id)) {
    return res.status(400).json({ error: 'location_id must be a uuid' });
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
