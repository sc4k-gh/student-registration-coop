import './setup.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { mockSupabase } from './helpers.js';

vi.mock('../src/config/supabase.js', () => ({
  supabase: mockSupabase({ rows: [{ id: 'l1', name: 'Main Campus' }] }),
}));

let app;
beforeEach(async () => {
  vi.resetModules();
  ({ app } = await import('../src/index.js'));
});

describe('GET /locations', () => {
  it('returns locations list', async () => {
    const res = await request(app).get('/locations');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
