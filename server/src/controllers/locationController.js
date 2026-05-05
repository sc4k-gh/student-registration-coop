import { supabase } from '../config/supabase.js';

export const list = async (req, res) => {
  const { data, error } = await supabase.from('locations').select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};
