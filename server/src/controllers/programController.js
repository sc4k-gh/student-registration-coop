import { supabase } from '../config/supabase.js';

export const list = async (req, res) => {
  const { data, error } = await supabase
    .from('programs')
    .select('*, time_slots (*)')
    .eq('status', 'active');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};
