import { verifySubmission } from '../../../src/screens/auth/signup_page';

jest.mock('../../../src/lib/supabase', () => ({
  supabase: {},
}));

describe('verifySubmission (Signup)', () => {
  test('returns empty string if all fields are valid', () => {
    expect(verifySubmission('John Doe', 'test@example.com', '1234567890', 'password123', 'password123')).toBe('');
  });

  test('returns error if any required field is missing', () => {
    expect(verifySubmission('John Doe', 'test@example.com')).toBe('All fields are required');
  });

  test('returns error if passwords do not match', () => {
    expect(verifySubmission('John Doe', 'test@example.com', '1234567890', 'password123', 'differentpassword')).toBe('Both password fields must match.');
  });

  test('returns error if password is less than 6 characters', () => {
    expect(verifySubmission('John Doe', 'test@example.com', '1234567890', 'abc', 'abc')).toBe('Password must be at least 6 characters long.');
  });
});