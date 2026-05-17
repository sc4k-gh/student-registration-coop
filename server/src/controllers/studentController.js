import { supabase } from '../config/supabase.js';
import { isValidEmail } from '../utils/validation.js';

export const create = async (req, res) => {
  const { student_name, age, parent_email, parent_phone } = req.body ?? {};

  if (!student_name || !age || !parent_email || !parent_phone) {
    return res.status(400).json({
      error: 'student_name, age, parent_email, and parent_phone are required',
    });
  }
  if (!isValidEmail(parent_email)) {
    return res.status(400).json({ error: 'A valid parent_email is required' });
  }

  // parent_id is the authenticated parent — never trust the client for this.
  const { data, error } = await supabase
    .from('students')
    .insert({
      parent_id: req.user.id,
      student_name,
      age,
      parent_email,
      parent_phone,
    })
    .select()
    .single();

  if (error) {
    console.error('students.create failed', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
  res.status(201).json(data);
};
