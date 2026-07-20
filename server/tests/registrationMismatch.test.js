import './setup.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { mockSupabase, parentUser } from './helpers.js';

const STUDENT_ID = '00000000-0000-0000-0000-0000000000a1';
const SLOT_ID = '00000000-0000-0000-0000-0000000000b1';
const SLOT_PROGRAM_ID = '00000000-0000-0000-0000-0000000000c1';
const OTHER_PROGRAM_ID = '00000000-0000-0000-0000-0000000000c2';

vi.mock('../src/config/supabase.js', () => ({
  supabase: mockSupabase({
    user: parentUser,
    rowsByTable: {
      students: [{ id: STUDENT_ID, parent_id: parentUser.id }],
      time_slots: [{ id: SLOT_ID, program_id: SLOT_PROGRAM_ID }],
    },
    rpcData: { id: 'reg-1' },
  }),
}));

let app;
beforeEach(async () => {
  vi.resetModules();
  ({ app } = await import('../src/index.js'));
});

const post = (body) =>
  request(app).post('/registrations').set('Authorization', 'Bearer token').send(body);

describe('POST /registrations — program/slot consistency', () => {
  it('400 when time_slot_id belongs to a different program', async () => {
    const res = await post({
      student_id: STUDENT_ID,
      program_id: OTHER_PROGRAM_ID,
      time_slot_id: SLOT_ID,
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/does not belong/);
  });

  it('201 when the slot belongs to the requested program', async () => {
    const res = await post({
      student_id: STUDENT_ID,
      program_id: SLOT_PROGRAM_ID,
      time_slot_id: SLOT_ID,
    });
    expect(res.status).toBe(201);
  });

  it('400 on a non-uuid id', async () => {
    const res = await post({
      student_id: 'not-a-uuid',
      program_id: SLOT_PROGRAM_ID,
      time_slot_id: SLOT_ID,
    });
    expect(res.status).toBe(400);
  });
});
