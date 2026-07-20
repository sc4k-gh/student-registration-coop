import './setup.js';
import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { mockSupabase, resetRecording, queryFor, parentUser, adminUser } from './helpers.js';

const PROGRAM_ID = '00000000-0000-0000-0000-000000000011';
const LOCATION_ID = '00000000-0000-0000-0000-000000000021';

const asAdmin = async (rows = []) => {
  vi.resetModules();
  vi.doMock('../src/config/supabase.js', () => ({
    supabase: mockSupabase({ user: adminUser, rows }),
  }));
  const { app } = await import('../src/index.js');
  const { supabase } = await import('../src/config/supabase.js');
  resetRecording(supabase);
  return { app, supabase };
};

const auth = (req) => req.set('Authorization', 'Bearer tok');

describe('admin routes — auth & role guards', () => {
  it('401 without token', async () => {
    vi.resetModules();
    vi.doMock('../src/config/supabase.js', () => ({ supabase: mockSupabase() }));
    const { app } = await import('../src/index.js');

    const res = await request(app).get('/admin/students');
    expect(res.status).toBe(401);
  });

  it('403 when authenticated as parent', async () => {
    vi.resetModules();
    vi.doMock('../src/config/supabase.js', () => ({ supabase: mockSupabase({ user: parentUser }) }));
    const { app } = await import('../src/index.js');

    const res = await auth(request(app).get('/admin/students'));
    expect(res.status).toBe(403);
  });

  it('200 when authenticated as admin', async () => {
    const { app } = await asAdmin();
    const res = await auth(request(app).get('/admin/students'));
    expect(res.status).toBe(200);
  });
});

describe('GET /admin/students', () => {
  it('returns the rows the database produced', async () => {
    const students = [{ id: 'a', student_name: 'Kid', registrations: [] }];
    const { app } = await asAdmin(students);
    const res = await auth(request(app).get('/admin/students'));
    expect(res.body).toEqual(students);
  });

  it('embeds each registration and its program', async () => {
    const { app, supabase } = await asAdmin();
    await auth(request(app).get('/admin/students'));
    // The students screen renders registrations[0].programs.name — without both
    // embeds it silently shows "Not enrolled" for everyone.
    const select = queryFor(supabase, 'students').select[0][0];
    expect(select).toContain('registrations');
    expect(select).toContain('programs');
  });
});

describe('GET /admin/registrations', () => {
  it('embeds the applicant off the registration, not off the time slot', async () => {
    const { app, supabase } = await asAdmin();
    await auth(request(app).get('/admin/registrations'));

    const select = queryFor(supabase, 'registrations').select[0][0];
    // students must hang off registrations.student_id. Nested under time_slots it
    // resolves many-to-many through registrations and returns every student in the
    // slot rather than the one who applied.
    expect(select).toMatch(/students/);
    expect(select).not.toMatch(/time_slots\s*\([^)]*students/);
  });

  it('filters to pending registrations', async () => {
    const { app, supabase } = await asAdmin();
    await auth(request(app).get('/admin/registrations'));
    expect(queryFor(supabase, 'registrations').eq).toContainEqual(['status', 'pending']);
  });
});

describe('POST /admin/programs — validation', () => {
  it('400 on a level outside the enum', async () => {
    const { app } = await asAdmin();
    const res = await auth(request(app).post('/admin/programs')).send({
      name: 'X', level: 'expert', target_age: '8-10',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/level/);
  });
});

describe('PATCH /admin/programs/:id — validation', () => {
  it('400 on a non-uuid id', async () => {
    const { app } = await asAdmin();
    const res = await auth(request(app).patch('/admin/programs/not-a-uuid')).send({ status: 'active' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/uuid/);
  });

  it('404 when the program does not exist', async () => {
    const { app } = await asAdmin([]);
    const res = await auth(request(app).patch(`/admin/programs/${PROGRAM_ID}`)).send({ status: 'active' });
    expect(res.status).toBe(404);
  });
});

describe('POST /admin/time-slots — validation', () => {
  const base = {
    program_id: PROGRAM_ID,
    mode: 'online',
    day_of_week: 'mon',
    start_time: '09:00',
    end_time: '10:00',
    max_capacity: 5,
  };

  it('400 on an unknown mode', async () => {
    const { app } = await asAdmin();
    const res = await auth(request(app).post('/admin/time-slots')).send({ ...base, mode: 'hybrid' });
    expect(res.status).toBe(400);
  });

  it('400 on an unknown day_of_week', async () => {
    const { app } = await asAdmin();
    const res = await auth(request(app).post('/admin/time-slots')).send({ ...base, day_of_week: 'monday' });
    expect(res.status).toBe(400);
  });

  // max_capacity: 0 is falsy, so it is rejected by the required-fields check and
  // never reaches the range check — these values are truthy and must still fail.
  it.each([
    ['negative', -3],
    ['fractional', 2.5],
    ['numeric string', '5'],
  ])('400 on a %s max_capacity', async (_label, max_capacity) => {
    const { app } = await asAdmin();
    const res = await auth(request(app).post('/admin/time-slots')).send({ ...base, max_capacity });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/max_capacity/);
  });

  // Mirrors chk_mode_location in schema.sql, which would otherwise surface as a 500.
  it('400 when an in-person slot has no location', async () => {
    const { app } = await asAdmin();
    const res = await auth(request(app).post('/admin/time-slots')).send({ ...base, mode: 'in-person' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/location/);
  });

  it('400 when an online slot carries a location', async () => {
    const { app } = await asAdmin();
    const res = await auth(request(app).post('/admin/time-slots')).send({ ...base, location_id: LOCATION_ID });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/location/);
  });

  it('201 on a valid online slot', async () => {
    const { app } = await asAdmin([{ id: 'slot-1' }]);
    const res = await auth(request(app).post('/admin/time-slots')).send(base);
    expect(res.status).toBe(201);
  });
});
