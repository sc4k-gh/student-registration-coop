import { verifySubmission } from '../../../src/screens/auth/login_page';

jest.mock('../../../src/lib/supabase', () => ({
  supabase: {},
}));

describe('verifySubmission (Login)', () => {
  test('returns empty string if all fields are valid', () => {
    expect(verifySubmission('test@example.com', 'password123')).toBe('');
  });

  test('returns error if email is missing', () => {
    expect(verifySubmission('', 'password123')).toBe('All fields are required');
  });

  test('returns error if password is missing', () => {
    expect(verifySubmission('test@example.com', '')).toBe('All fields are required');
  });

  test('returns error if both fields are missing', () => {
    expect(verifySubmission('', '')).toBe('All fields are required');
  });
});