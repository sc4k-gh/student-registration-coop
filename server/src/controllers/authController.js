import { supabase, supabaseAnon } from '../config/supabase.js';
import { isValidEmail } from '../utils/validation.js';

// Role is derived from the email domain (architecture.md §1). Server-only.
const ADMIN_DOMAIN = 'sc4k.ca';
const roleForEmail = (email) =>
  email.trim().toLowerCase().endsWith(`@${ADMIN_DOMAIN}`) ? 'admin' : 'parent';

export const signup = async (req, res) => {
  const { emailAddress, password, name, phone_number } = req.body ?? {};

  if (!emailAddress || !password || !name || !phone_number) {
    return res
      .status(400)
      .json({ error: 'emailAddress, password, name, and phone_number are required' });
  }
  if (!isValidEmail(emailAddress)) {
    return res.status(400).json({ error: 'A valid emailAddress is required' });
  }

  const role = roleForEmail(emailAddress);

  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email: emailAddress,
    password,
    email_confirm: true,
    app_metadata: { role },
    user_metadata: { name, phone_number },
  });
  if (createErr) {
    return res.status(400).json({ error: createErr.message });
  }

  const authUser = created.user;

  const { error: insertErr } = await supabase.from('users').insert({
    id: authUser.id,
    email: emailAddress,
    role,
    name,
    phone_number,
  });
  if (insertErr) {
    await supabase.auth.admin.deleteUser(authUser.id);
    console.error('signup: users insert failed', insertErr);
    return res.status(500).json({ error: 'Internal server error' });
  }

  const { data: session, error: signInErr } = await supabaseAnon.auth.signInWithPassword({
    email: emailAddress,
    password,
  });
  if (signInErr) {
    console.error('signup: post-create sign-in failed', signInErr);
    return res.status(500).json({ error: 'Internal server error' });
  }

  res
    .status(201)
    .json({ user: { id: authUser.id, email: emailAddress, name }, session: session.session });
};

export const login = async (req, res) => {
  const { emailAddress, password } = req.body ?? {};
  if (!emailAddress || !password) {
    return res.status(400).json({ error: 'emailAddress and password are required' });
  }

  const { data, error } = await supabaseAnon.auth.signInWithPassword({
    email: emailAddress,
    password,
  });
  if (error) {
    return res.status(401).json({ error: error.message });
  }

  res.json({ user: data.user, session: data.session });
};
