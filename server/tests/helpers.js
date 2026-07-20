import { vi } from 'vitest';

// The builder records what was asked of it, not just what it returns. Without this
// a test cannot tell "fetch active programs" from "fetch everything" — the filter is
// invisible to the mock, so query-shape bugs pass unnoticed.
export const mockSupabase = (overrides = {}) => {
  const queries = [];

  const builder = (table, rows, error) => {
    const record = { table, select: [], eq: [], order: [], insert: [], update: [], delete: 0 };
    queries.push(record);

    const result = { data: rows, error: error ?? null };
    const chain = {
      select: vi.fn((...args) => { record.select.push(args); return chain; }),
      insert: vi.fn((...args) => { record.insert.push(args); return chain; }),
      update: vi.fn((...args) => { record.update.push(args); return chain; }),
      delete: vi.fn(() => { record.delete += 1; return chain; }),
      eq: vi.fn((...args) => { record.eq.push(args); return chain; }),
      order: vi.fn((...args) => { record.order.push(args); return chain; }),
      single: vi.fn(() => Promise.resolve({ data: rows[0] ?? null, error: error ?? null })),
      maybeSingle: vi.fn(() => Promise.resolve({ data: rows[0] ?? null, error: error ?? null })),
      then: (resolve) => resolve(result),
    };
    return chain;
  };

  return {
    // rowsByTable gives different tables different rows, for controllers that query
    // more than one; rows stays the single-table shorthand.
    from: vi.fn((table) =>
      builder(
        table,
        overrides.rowsByTable?.[table] ?? overrides.rows ?? [],
        overrides.errorByTable?.[table],
      ),
    ),
    rpc: vi.fn(() => Promise.resolve({ data: overrides.rpcData ?? null, error: overrides.rpcError ?? null })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({
        data: overrides.user ? { user: overrides.user } : { user: null },
        error: overrides.user ? null : { message: 'no user' },
      })),
      signInWithPassword: vi.fn(() => Promise.resolve({
        data: { user: overrides.user ?? null, session: { access_token: 'tok' } },
        error: overrides.signInError ?? null,
      })),
      admin: {
        createUser: vi.fn(() => Promise.resolve({
          data: { user: overrides.user ?? { id: 'new-uuid', email: 'x@y.z' } },
          error: overrides.createUserError ?? null,
        })),
        deleteUser: vi.fn(() => Promise.resolve({ data: null, error: null })),
        updateUserById: vi.fn(() => Promise.resolve({ data: null, error: null })),
      },
    },
    queries,
    ...overrides.extra,
  };
};

// vi.mock caches its factory result, so every test in a file shares one mock
// instance — vi.resetModules() does not give you a fresh one. Without clearing,
// assertions on mock.calls[0] read whatever an earlier test recorded, which makes
// them pass no matter what the code under test did.
export const resetRecording = (supabase) => {
  supabase.queries.length = 0;
  vi.clearAllMocks();
};

// The recorded query against `table`. Throws rather than returning undefined so a
// test that never hit the table fails loudly instead of on a confusing property read.
export const queryFor = (supabase, table) => {
  const found = supabase.queries.filter((q) => q.table === table);
  if (found.length === 0) {
    const seen = supabase.queries.map((q) => q.table).join(', ') || '(none)';
    throw new Error(`No query against "${table}". Tables queried: ${seen}`);
  }
  return found[found.length - 1];
};

// Flattened .eq() arguments, for asserting a filter was applied.
export const eqArgs = (supabase, table) => queryFor(supabase, table).eq;

export const parentUser = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'parent@test.com',
  app_metadata: { role: 'parent' },
};

export const adminUser = {
  id: '00000000-0000-0000-0000-000000000002',
  email: 'admin@test.com',
  app_metadata: { role: 'admin' },
};
