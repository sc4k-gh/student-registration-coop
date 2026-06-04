import { verifySubmission } from '../../../src/screens/parent/registration_form';

jest.mock('../../../src/lib/supabase', () => ({ supabase: {} }));

describe('verifySubmission (Registration Form)', () => {
  test('returns empty string if all fields are valid', () => {
    expect(verifySubmission('John Doe', '10', 'parent@test.com', '1234567890', 'program-id', 'online', 'slot-id', '', '2026-06-10')).toBe('');
  });

  test('returns error if any required field is missing', () => {
    expect(verifySubmission('', '', '', '', '', '', '')).toBe('Please fill in all required fields.');
  });

  test('returns error if age is not a valid number', () => {
    expect(verifySubmission('John Doe', 'abc', 'parent@test.com', '1234567890', 'program-id', 'online', 'slot-id', '', '2026-06-10')).toBe('Age must be a positive whole number.');
  });

  test('returns error if age is zero or negative', () => {
    expect(verifySubmission('John Doe', '0', 'parent@test.com', '1234567890', 'program-id', 'online', 'slot-id', '', '2026-06-10')).toBe('Age must be a positive whole number.');
  });

  test('returns error if in-person mode has no location selected', () => {
    expect(verifySubmission('John Doe', '10', 'parent@test.com', '1234567890', 'program-id', 'in-person', 'slot-id', '', '2026-06-10')).toBe('Please select a location for in-person mode.');
  });

  test('returns empty string if in-person mode has a location selected', () => {
    expect(verifySubmission('John Doe', '10', 'parent@test.com', '1234567890', 'program-id', 'in-person', 'slot-id', 'location-id', '2026-06-10')).toBe('');
  });

  test('returns error if no first class date is available', () => {
    expect(verifySubmission('John Doe', '10', 'parent@test.com', '1234567890', 'program-id', 'online', 'slot-id', '', null)).toBe('No upcoming class date is available for this slot.');
  });
});