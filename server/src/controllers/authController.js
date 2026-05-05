import { supabase } from '../config/supabase.js';

export const signup = async (req, res) => {
  const { emailAddress, password, name, phone_number } = req.body ?? {};

  if (!emailAddress || !password || !name || !phone_number) {
    return res
      .status(400)
      .json({ error: 'emailAddress, password, name, and phone_number are required' });
  }

  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email: emailAddress,
    password,
    email_confirm: true,
    app_metadata: { role: 'parent' },
    user_metadata: { name, phone_number },
  });
  if (createErr) {
    return res.status(400).json({ error: createErr.message });
  }

  const authUser = created.user;

  const { error: insertErr } = await supabase.from('users').insert({
    id: authUser.id,
    email: emailAddress,
    password_hash: 'supabase_managed',
    role: 'parent',
    name,
    phone_number,
  });
  if (insertErr) {
    await supabase.auth.admin.deleteUser(authUser.id);
    return res.status(500).json({ error: insertErr.message });
  }

  const { data: session, error: signInErr } = await supabase.auth.signInWithPassword({
    email: emailAddress,
    password,
  });
  if (signInErr) {
    return res.status(500).json({ error: signInErr.message });
  }

  res.status(201).json({ user: { id: authUser.id, email: emailAddress, name }, session: session.session });
};

export const login = async (req, res) => {
  const { emailAddress, password } = req.body ?? {};
  if (!emailAddress || !password) {
    return res.status(400).json({ error: 'emailAddress and password are required' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailAddress,
    password,
  });
  if (error) {
    return res.status(401).json({ error: error.message });
  }

  res.json({ user: data.user, session: data.session });
};

export const setupPassword = async (req, res) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { password } = req.body ?? {};
  if (!password) {
    return res.status(400).json({ error: 'password is required' });
  }

  const { error } = await supabase.auth.admin.updateUserById(req.user.id, { password });
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json({ success: true });
};
