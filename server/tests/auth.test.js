import './setup.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { mockSupabase, resetRecording, queryFor } from './helpers.js';

vi.mock('../src/config/supabase.js', () => ({ supabase: mockSupabase() }));

let app;
let supabase;
beforeEach(async () => {
  vi.resetModules();
  ({ app } = await import('../src/index.js'));
  ({ supabase } = await import('../src/config/supabase.js'));
  resetRecording(supabase);
});

const validSignup = {
  emailAddress: 'parent@example.com',
  password: 'hunter2hunter2',
  name: 'Pat Parent',
  phone_number: '5551234567',
};

describe('POST /auth/signup', () => {
  it('400 when required fields missing', async () => {
    const res = await request(app).post('/auth/signup').send({ emailAddress: 'a@b.c' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  it.each([
    ['no @', 'not-an-email'],
    ['no domain dot', 'user@localhost'],
    ['contains a space', 'user name@example.com'],
  ])('400 when emailAddress is malformed (%s)', async (_label, emailAddress) => {
    const res = await request(app).post('/auth/signup').send({ ...validSignup, emailAddress });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });

  it('creates the auth user and the users row, then returns 201', async () => {
    const res = await request(app).post('/auth/signup').send(validSignup);
    expect(res.status).toBe(201);

    const createArgs = supabase.auth.admin.createUser.mock.calls[0][0];
    expect(createArgs.email).toBe(validSignup.emailAddress);

    const inserted = queryFor(supabase, 'users').insert[0][0];
    expect(inserted).toMatchObject({ role: 'parent', email: validSignup.emailAddress });
  });

  // Regression: signup used to insert password_hash: 'supabase_managed', a leftover
  // from before Supabase Auth owned credentials. The column had been dropped from the
  // live table, so every signup failed with PGRST204 ("could not find the
  // 'password_hash' column ... in the schema cache") and the rollback deleted the
  // auth user — silently, because the client swallowed the error. Any column here
  // that does not exist in the users table breaks signup the same way.
  it('inserts only columns that exist on the users table', async () => {
    await request(app).post('/auth/signup').send(validSignup);

    const inserted = queryFor(supabase, 'users').insert[0][0];
    expect(Object.keys(inserted).sort()).toEqual(
      ['email', 'id', 'name', 'phone_number', 'role'].sort(),
    );
    expect(inserted).not.toHaveProperty('password_hash');
  });

  it('pins the role server-side and ignores a client-supplied one', async () => {
    await request(app).post('/auth/signup').send({ ...validSignup, role: 'admin' });
    // Privilege escalation guard: role must never be read from the request body.
    expect(supabase.auth.admin.createUser.mock.calls[0][0].app_metadata).toEqual({ role: 'parent' });
    expect(queryFor(supabase, 'users').insert[0][0].role).toBe('parent');
  });
});

describe('POST /auth/login', () => {
  it('400 when fields missing', async () => {
    const res = await request(app).post('/auth/login').send({});
    expect(res.status).toBe(400);
  });

  it('401 when supabase rejects the credentials', async () => {
    vi.resetModules();
    vi.doMock('../src/config/supabase.js', () => ({
      supabase: mockSupabase({ signInError: { message: 'Invalid login credentials' } }),
    }));
    ({ app } = await import('../src/index.js'));

    const res = await request(app)
      .post('/auth/login')
      .send({ emailAddress: 'a@b.co', password: 'wrong' });
    expect(res.status).toBe(401);
  });
});
