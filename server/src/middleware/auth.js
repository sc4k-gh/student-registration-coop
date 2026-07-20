import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const token = header.slice('Bearer '.length);

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = {
    id: data.user.id,
    email: data.user.email,
    role: data.user.app_metadata?.role ?? null,
  };
  next();
});
