import './setup.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { mockSupabase, resetRecording, queryFor } from './helpers.js';

const LOCATION = { id: '00000000-0000-0000-0000-000000000021', name: 'Main Campus' };

vi.mock('../src/config/supabase.js', () => ({
  supabase: mockSupabase({ rows: [LOCATION] }),
}));

let app;
let supabase;
beforeEach(async () => {
  vi.resetModules();
  ({ app } = await import('../src/index.js'));
  ({ supabase } = await import('../src/config/supabase.js'));
  resetRecording(supabase);
});

describe('GET /locations', () => {
  it('returns the rows the database produced', async () => {
    const res = await request(app).get('/locations');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([LOCATION]);
  });

  it('reads from the locations table', async () => {
    await request(app).get('/locations');
    expect(queryFor(supabase, 'locations').select).toHaveLength(1);
  });
});
