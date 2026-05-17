// Shared validation + pagination helpers.

export const isValidEmail = (email) =>
  typeof email === 'string' &&
  email.length <= 254 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Admin lists show 10 per page.
export const PAGE_SIZE = 10;

// Maps ?page (1-based) to a Supabase .range(from, to) tuple.
export const pageRange = (pageParam) => {
  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  return { page, from, to: from + PAGE_SIZE - 1 };
};
