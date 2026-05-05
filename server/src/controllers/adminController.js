import { supabase } from '../config/supabase.js';

const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

export const listStudents = async (_req, res) => {
  const { data, error } = await supabase
    .from('students')
    .select('*, registrations (*, programs (*))');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const listTeachers = async (_req, res) => {
  const { data, error } = await supabase
    .from('teachers')
    .select('*, time_slots (*, programs (*))');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const listTeacherStudents = async (req, res) => {
  const { data, error } = await supabase
    .from('time_slots')
    .select('id, teacher_id, day_of_week, registrations (student_id, students (*))')
    .eq('teacher_id', req.params.id)
    .order('day_of_week', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const createTeacher = async (req, res) => {
  const { name, email, phone_number } = req.body ?? {};
  if (!name) return res.status(400).json({ error: 'name is required' });
  if (email && !isValidEmail(email)) {
    return res.status(400).json({ error: 'invalid email' });
  }

  const { data, error } = await supabase
    .from('teachers')
    .insert({ name, email, phone_number })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

export const createProgram = async (req, res) => {
  const { name, level, target_age, description, prerequisites } = req.body ?? {};
  if (!name || !level || !target_age) {
    return res.status(400).json({ error: 'name, level, and target_age are required' });
  }
  if (!['beginner', 'intermediate', 'advanced'].includes(level)) {
    return res.status(400).json({ error: 'level must be beginner, intermediate, or advanced' });
  }

  const { data, error } = await supabase
    .from('programs')
    .insert({ name, level, target_age, description, prerequisites })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

export const updateProgram = async (req, res) => {
  const { status } = req.body ?? {};
  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ error: 'status must be active or inactive' });
  }

  const { data, error } = await supabase
    .from('programs')
    .update({ status })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const getProgram = async (req, res) => {
  const { data, error } = await supabase
    .from('programs')
    .select('*, time_slots (id, mode, teacher_id, day_of_week, max_capacity, current_count)')
    .eq('id', req.params.id)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Program not found' });
  res.json(data);
};

export const createTimeSlot = async (req, res) => {
  const {
    program_id,
    teacher_id,
    location_id,
    mode,
    day_of_week,
    start_time,
    end_time,
    max_capacity,
  } = req.body ?? {};

  if (!program_id || !mode || !day_of_week || !start_time || !end_time || !max_capacity) {
    return res.status(400).json({
      error: 'program_id, mode, day_of_week, start_time, end_time, and max_capacity are required',
    });
  }

  const { data, error } = await supabase
    .from('time_slots')
    .insert({
      program_id,
      teacher_id,
      location_id,
      mode,
      day_of_week,
      start_time,
      end_time,
      max_capacity,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

export const listPendingRegistrations = async (_req, res) => {
  const { data, error } = await supabase
    .from('registrations')
    .select('*, time_slots (*, students (*), programs (name))')
    .eq('status', 'pending');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const reviewRegistration = async (req, res) => {
  const { status } = req.body ?? {};
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'status must be pending, approved, or rejected' });
  }

  const { data, error } = await supabase
    .from('registrations')
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: req.user.id,
    })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};
