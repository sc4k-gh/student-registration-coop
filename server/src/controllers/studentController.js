import { supabase } from '../config/supabase.js';
import { isValidEmail } from '../utils/validation.js';

export const create = async (req, res) => {
  const {
    student_name,
    student_email,
    student_phone,
    age,
    description,
    parent_name,
    parent_email,
    parent_phone,
  } = req.body ?? {};

  if (!student_name || age === undefined || age === null || !parent_name || !parent_email || !parent_phone) {
    return res.status(400).json({
      error: 'student_name, age, parent_name, parent_email, and parent_phone are required',
    });
  }
  if (!Number.isInteger(age) || age <= 0) {
    return res.status(400).json({ error: 'age must be a positive integer' });
  }
  if (!isValidEmail(parent_email)) {
    return res.status(400).json({ error: 'invalid parent_email' });
  }
  if (student_email && !isValidEmail(student_email)) {
    return res.status(400).json({ error: 'invalid student_email' });
  }

  const { data, error } = await supabase
    .from('students')
    .insert({
      parent_id: req.user.id,
      student_name,
      student_email,
      student_phone,
      age,
      description,
      parent_name,
      parent_email,
      parent_phone,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};
