import './setup.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { mockSupabase } from './helpers.js';

vi.mock('../src/config/supabase.js', () => ({
  supabase: mockSupabase({
    rows: [
      { id: 's1', current_count: 5, max_capacity: 5 },
      { id: 's2', current_count: 2, max_capacity: 5 },
    ],
  }),
}));

let app;
beforeEach(async () => {
  vi.resetModules();
  ({ app } = await import('../src/index.js'));
});

describe('GET /time-slots', () => {
  it('400 without program_id and mode', async () => {
    const res = await request(app).get('/time-slots');
    expect(res.status).toBe(400);
  });

  it('filters out full slots', async () => {
    const res = await request(app).get('/time-slots?program_id=p1&mode=online');
    expect(res.status).toBe(200);
    expect(res.body.every((s) => s.current_count < s.max_capacity)).toBe(true);
  });
});
