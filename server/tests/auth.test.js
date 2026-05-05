import './setup.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { mockSupabase } from './helpers.js';

vi.mock('../src/config/supabase.js', () => ({ supabase: mockSupabase() }));

let app;
beforeEach(async () => {
  vi.resetModules();
  ({ app } = await import('../src/index.js'));
});

describe('POST /auth/signup', () => {
  it('400 when required fields missing', async () => {
    const res = await request(app).post('/auth/signup').send({ emailAddress: 'a@b.c' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });
});

describe('POST /auth/login', () => {
  it('400 when fields missing', async () => {
    const res = await request(app).post('/auth/login').send({});
    expect(res.status).toBe(400);
  });
});
