import { supabase } from '../config/supabase.js';

export const list = async (req, res) => {
  const { data, error } = await supabase.from('locations').select();
  if (error) {
    console.error('locations.list failed', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
  res.json(data);
};
