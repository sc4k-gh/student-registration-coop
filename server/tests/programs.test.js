import './setup.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { mockSupabase, resetRecording, queryFor } from './helpers.js';

const ACTIVE_PROGRAM = {
  id: '00000000-0000-0000-0000-000000000011',
  name: 'Python',
  status: 'active',
  time_slots: [],
};

vi.mock('../src/config/supabase.js', () => ({
  supabase: mockSupabase({ rows: [ACTIVE_PROGRAM] }),
}));

let app;
let supabase;
beforeEach(async () => {
  vi.resetModules();
  ({ app } = await import('../src/index.js'));
  ({ supabase } = await import('../src/config/supabase.js'));
  resetRecording(supabase);
});

describe('GET /programs', () => {
  it('returns the rows the database produced', async () => {
    const res = await request(app).get('/programs');
    expect(res.status).toBe(200);
    // Asserting the payload, not just that it is an array — an endpoint that always
    // returned [] would satisfy Array.isArray.
    expect(res.body).toEqual([ACTIVE_PROGRAM]);
  });

  it('queries programs and embeds their time slots', async () => {
    await request(app).get('/programs');
    expect(queryFor(supabase, 'programs').select[0][0]).toContain('time_slots');
  });

  it('filters to active programs only', async () => {
    await request(app).get('/programs');
    // The public list must never expose inactive programs; the filter lives in the
    // query, so it is only observable here.
    expect(queryFor(supabase, 'programs').eq).toContainEqual(['status', 'active']);
  });
});
