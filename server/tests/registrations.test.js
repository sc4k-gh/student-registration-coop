import './setup.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { mockSupabase, parentUser } from './helpers.js';

vi.mock('../src/config/supabase.js', () => ({
  supabase: mockSupabase({ user: parentUser }),
}));

let app;
beforeEach(async () => {
  vi.resetModules();
  ({ app } = await import('../src/index.js'));
});

describe('POST /registrations', () => {
  it('401 without auth header', async () => {
    const res = await request(app).post('/registrations').send({});
    expect(res.status).toBe(401);
  });

  it('400 with auth but missing fields', async () => {
    const res = await request(app)
      .post('/registrations')
      .set('Authorization', 'Bearer token')
      .send({});
    expect(res.status).toBe(400);
  });
});
