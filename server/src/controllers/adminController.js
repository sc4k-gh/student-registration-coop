import { supabase } from '../config/supabase.js';
import { isValidEmail, pageRange, PAGE_SIZE } from '../utils/validation.js';

const fail = (res, where, error) => {
  console.error(`${where} failed`, error);
  return res.status(500).json({ error: 'Internal server error' });
};

// Admin home: enrolled (approved) + pending counts.
export const summary = async (_req, res) => {
  const approved = await supabase
    .from('registrations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');
  if (approved.error) return fail(res, 'admin.summary approved', approved.error);

  const pending = await supabase
    .from('registrations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');
  if (pending.error) return fail(res, 'admin.summary pending', pending.error);

  res.json({
    enrolled_count: approved.count ?? 0,
    pending_count: pending.count ?? 0,
  });
};

// Dynamic filter over registrations. Only whitelisted axes are honored.
export const query = async (req, res) => {
  const { page, from, to } = pageRange(req.query.page);

  let q = supabase
    .from('registrations')
    .select(
      '*, students (*), time_slots (*, programs (*), teachers (*), locations (*))',
    );

  if (req.query.program_id) q = q.eq('program_id', req.query.program_id);
  if (req.query.mode) q = q.eq('time_slots.mode', req.query.mode);
  if (req.query.teacher_id) q = q.eq('time_slots.teacher_id', req.query.teacher_id);
  if (req.query.location_id) q = q.eq('time_slots.location_id', req.query.location_id);

  const { data, error } = await q.range(from, to);
  if (error) return fail(res, 'admin.query', error);
  res.json({ data, page, page_size: PAGE_SIZE });
};

export const listStudents = async (req, res) => {
  const { page, from, to } = pageRange(req.query.page);
  const { data, error } = await supabase
    .from('students')
    .select('*, registrations (*, programs (*))')
    .range(from, to);
  if (error) return fail(res, 'admin.listStudents', error);
  res.json({ data, page, page_size: PAGE_SIZE });
};

export const listTeachers = async (req, res) => {
  const { page, from, to } = pageRange(req.query.page);
  const { data, error } = await supabase
    .from('teachers')
    .select('*, time_slots (*, programs (*))')
    .range(from, to);
  if (error) return fail(res, 'admin.listTeachers', error);
  res.json({ data, page, page_size: PAGE_SIZE });
};

export const listTeacherStudents = async (req, res) => {
  const { data, error } = await supabase
    .from('time_slots')
    .select('id, teacher_id, day_of_week, registrations (student_id, students (*))')
    .eq('teacher_id', req.params.id)
    .order('day_of_week', { ascending: true });

  if (error) return fail(res, 'admin.listTeacherStudents', error);
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

  if (error) return fail(res, 'admin.createTeacher', error);
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

  if (error) return fail(res, 'admin.createProgram', error);
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

  if (error) return fail(res, 'admin.updateProgram', error);
  res.json(data);
};

export const getProgram = async (req, res) => {
  const { data, error } = await supabase
    .from('programs')
    .select('*, time_slots (id, mode, teacher_id, day_of_week, max_capacity, current_count)')
    .eq('id', req.params.id)
    .maybeSingle();

  if (error) return fail(res, 'admin.getProgram', error);
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

  if (error) return fail(res, 'admin.createTimeSlot', error);
  res.status(201).json(data);
};

export const listPendingRegistrations = async (req, res) => {
  const { page, from, to } = pageRange(req.query.page);
  const { data, error } = await supabase
    .from('registrations')
    .select('*, time_slots (*, students (*), programs (name))')
    .eq('status', 'pending')
    .range(from, to);

  if (error) return fail(res, 'admin.listPendingRegistrations', error);
  res.json({ data, page, page_size: PAGE_SIZE });
};

export const reviewRegistration = async (req, res) => {
  const { status } = req.body ?? {};
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'status must be pending, approved, or rejected' });
  }

  // Atomic: status change + capacity release on reject (architecture.md §5).
  const { data, error } = await supabase.rpc('review_registration', {
    p_registration_id: req.params.id,
    p_status: status,
    p_reviewer_id: req.user.id,
  });

  if (error) {
    if (error.code === 'P0002') return res.status(404).json({ error: 'Registration not found' });
    return fail(res, 'admin.reviewRegistration', error);
  }
  res.json(data);
};
