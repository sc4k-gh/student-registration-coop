import './setup.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { mockSupabase, resetRecording, queryFor, parentUser } from './helpers.js';

const STUDENT_ID = '00000000-0000-0000-0000-0000000000a1';
const SLOT_ID = '00000000-0000-0000-0000-0000000000b1';
const PROGRAM_ID = '00000000-0000-0000-0000-0000000000c1';

const OTHER_PARENT_STUDENT = [];

vi.mock('../src/config/supabase.js', () => ({
  supabase: mockSupabase({
    user: parentUser,
    rowsByTable: {
      students: [{ id: STUDENT_ID, parent_id: parentUser.id }],
      time_slots: [{ id: SLOT_ID, program_id: PROGRAM_ID, day_of_week: 'tue' }],
    },
  }),
}));

let app;
let supabase;
beforeEach(async () => {
  vi.resetModules();
  ({ app } = await import('../src/index.js'));
  ({ supabase } = await import('../src/config/supabase.js'));
  resetRecording(supabase);
});

describe('POST /registrations — guards', () => {
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

describe('POST /registrations — first class date', () => {
  it('passes the next slot weekday to the registration RPC', async () => {
    const res = await request(app)
      .post('/registrations')
      .set('Authorization', 'Bearer token')
      .send({ student_id: STUDENT_ID, program_id: PROGRAM_ID, time_slot_id: SLOT_ID });

    expect(res.status).toBe(201);
    const rpcArgs = supabase.rpc.mock.calls[0][0] === 'register_with_capacity'
      ? supabase.rpc.mock.calls[0][1]
      : null;
    expect(rpcArgs).toMatchObject({
      p_student_id: STUDENT_ID,
      p_program_id: PROGRAM_ID,
      p_time_slot_id: SLOT_ID,
    });
    expect(new Date(`${rpcArgs.p_first_class_date}T00:00:00Z`).getUTCDay()).toBe(2);
  });
});

describe('POST /registrations — student ownership', () => {
  it('403 when the student belongs to another parent', async () => {
    vi.resetModules();
    vi.doMock('../src/config/supabase.js', () => ({
      supabase: mockSupabase({ user: parentUser, rowsByTable: { students: OTHER_PARENT_STUDENT } }),
    }));
    ({ app } = await import('../src/index.js'));
    ({ supabase } = await import('../src/config/supabase.js'));

    const res = await request(app)
      .post('/registrations')
      .set('Authorization', 'Bearer token')
      .send({ student_id: STUDENT_ID, program_id: PROGRAM_ID, time_slot_id: SLOT_ID });

    expect(res.status).toBe(403);
    // Ownership must be enforced in the query, not just by reading a returned row.
    expect(queryFor(supabase, 'students').eq).toContainEqual(['parent_id', parentUser.id]);
  });
});

describe('GET /registrations/my', () => {
  it('scopes the lookup to the calling parent', async () => {
    const res = await request(app)
      .get('/registrations/my')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(200);
    expect(queryFor(supabase, 'students').eq).toContainEqual(['parent_id', parentUser.id]);
  });
});
