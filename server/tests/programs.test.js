import './setup.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { mockSupabase } from './helpers.js';

vi.mock('../src/config/supabase.js', () => ({
  supabase: mockSupabase({ rows: [{ id: 'p1', name: 'Python', status: 'active' }] }),
}));

let app;
beforeEach(async () => {
  vi.resetModules();
  ({ app } = await import('../src/index.js'));
});

describe('GET /programs', () => {
  it('returns programs list', async () => {
    const res = await request(app).get('/programs');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
