// Shared validation + pagination helpers.

export const isValidEmail = (email) =>
  typeof email === 'string' &&
  email.length <= 254 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Admin lists show 10 per page.
export const PAGE_SIZE = 10;
const MAX_PAGE = 10_000;

// Maps ?page (1-based) to a Supabase .range(from, to) tuple. Page is clamped
// to [1, MAX_PAGE] so a malicious ?page=99999999 can't trigger huge scans.
export const pageRange = (pageParam) => {
  const raw = parseInt(pageParam, 10) || 1;
  const page = Math.min(MAX_PAGE, Math.max(1, raw));
  const from = (page - 1) * PAGE_SIZE;
  return { page, from, to: from + PAGE_SIZE - 1 };
};
