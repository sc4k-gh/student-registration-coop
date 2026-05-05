import './setup.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { mockSupabase, parentUser, adminUser } from './helpers.js';

let app;

describe('admin routes — auth & role guards', () => {
  it('401 without token', async () => {
    vi.resetModules();
    vi.doMock('../src/config/supabase.js', () => ({ supabase: mockSupabase() }));
    ({ app } = await import('../src/index.js'));

    const res = await request(app).get('/admin/students');
    expect(res.status).toBe(401);
  });

  it('403 when authenticated as parent', async () => {
    vi.resetModules();
    vi.doMock('../src/config/supabase.js', () => ({ supabase: mockSupabase({ user: parentUser }) }));
    ({ app } = await import('../src/index.js'));

    const res = await request(app)
      .get('/admin/students')
      .set('Authorization', 'Bearer tok');
    expect(res.status).toBe(403);
  });

  it('200 when authenticated as admin', async () => {
    vi.resetModules();
    vi.doMock('../src/config/supabase.js', () => ({
      supabase: mockSupabase({ user: adminUser, rows: [] }),
    }));
    ({ app } = await import('../src/index.js'));

    const res = await request(app)
      .get('/admin/students')
      .set('Authorization', 'Bearer tok');
    expect(res.status).toBe(200);
  });
});
