import './setup.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { mockSupabase, resetRecording, queryFor } from './helpers.js';

const PROGRAM_ID = '00000000-0000-0000-0000-000000000011';
const LOCATION_ID = '00000000-0000-0000-0000-000000000021';

const FULL_SLOT = { id: 's1', current_count: 5, max_capacity: 5 };
const OPEN_SLOT = { id: 's2', current_count: 2, max_capacity: 5 };

vi.mock('../src/config/supabase.js', () => ({
  supabase: mockSupabase({ rows: [FULL_SLOT, OPEN_SLOT] }),
}));

let app;
let supabase;
beforeEach(async () => {
  vi.resetModules();
  ({ app } = await import('../src/index.js'));
  ({ supabase } = await import('../src/config/supabase.js'));
  resetRecording(supabase);
});

describe('GET /time-slots — validation', () => {
  it('400 without program_id and mode', async () => {
    const res = await request(app).get('/time-slots');
    expect(res.status).toBe(400);
  });

  it('400 on a non-uuid program_id', async () => {
    const res = await request(app).get('/time-slots?program_id=p1&mode=online');
    expect(res.status).toBe(400);
  });

  it('400 on an unknown mode', async () => {
    const res = await request(app).get(`/time-slots?program_id=${PROGRAM_ID}&mode=hybrid`);
    expect(res.status).toBe(400);
  });
});

describe('GET /time-slots — filtering', () => {
  it('returns only slots with room left', async () => {
    const res = await request(app).get(`/time-slots?program_id=${PROGRAM_ID}&mode=online`);
    expect(res.status).toBe(200);
    // Naming the excluded slot, so a broken filter fails on identity rather than on
    // a predicate that an empty array would also satisfy.
    expect(res.body).toEqual([OPEN_SLOT]);
  });

  it('scopes the query to the requested program and mode', async () => {
    await request(app).get(`/time-slots?program_id=${PROGRAM_ID}&mode=online`);
    const eq = queryFor(supabase, 'time_slots').eq;
    expect(eq).toContainEqual(['program_id', PROGRAM_ID]);
    expect(eq).toContainEqual(['mode', 'online']);
  });

  it('applies the location filter only when one is supplied', async () => {
    await request(app).get(`/time-slots?program_id=${PROGRAM_ID}&mode=online`);
    expect(queryFor(supabase, 'time_slots').eq).not.toContainEqual(
      expect.arrayContaining(['location_id']),
    );

    await request(app).get(
      `/time-slots?program_id=${PROGRAM_ID}&mode=in-person&location_id=${LOCATION_ID}`,
    );
    expect(queryFor(supabase, 'time_slots').eq).toContainEqual(['location_id', LOCATION_ID]);
  });
});
