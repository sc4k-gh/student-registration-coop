import { vi } from 'vitest';

export const mockSupabase = (overrides = {}) => {
  const builder = (rows = []) => {
    const chain = {
      select: vi.fn(() => chain),
      insert: vi.fn(() => chain),
      update: vi.fn(() => chain),
      delete: vi.fn(() => chain),
      eq: vi.fn(() => chain),
      order: vi.fn(() => chain),
      single: vi.fn(() => Promise.resolve({ data: rows[0] ?? null, error: null })),
      maybeSingle: vi.fn(() => Promise.resolve({ data: rows[0] ?? null, error: null })),
      then: (resolve) => resolve({ data: rows, error: null }),
    };
    return chain;
  };

  return {
    from: vi.fn(() => builder(overrides.rows ?? [])),
    rpc: vi.fn(() => Promise.resolve({ data: overrides.rpcData ?? null, error: overrides.rpcError ?? null })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({
        data: overrides.user ? { user: overrides.user } : { user: null },
        error: overrides.user ? null : { message: 'no user' },
      })),
      signInWithPassword: vi.fn(() => Promise.resolve({
        data: { user: overrides.user ?? null, session: { access_token: 'tok' } },
        error: null,
      })),
      admin: {
        createUser: vi.fn(() => Promise.resolve({
          data: { user: overrides.user ?? { id: 'new-uuid', email: 'x@y.z' } },
          error: null,
        })),
        deleteUser: vi.fn(() => Promise.resolve({ data: null, error: null })),
        updateUserById: vi.fn(() => Promise.resolve({ data: null, error: null })),
      },
    },
    ...overrides.extra,
  };
};

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
