import { getEnrolledProgram } from '../../src/screens/student_page';

jest.mock('../../src/lib/supabase', () => ({ supabase: {} }));

describe('getEnrolledProgram', () => {
  test('returns program name from first registration', () => {
    const registrations = [{ programs: { name: 'Piano Basics' } }];
    expect(getEnrolledProgram(registrations)).toBe('Piano Basics');
  });

  test('returns fallback if registrations array is empty', () => {
    expect(getEnrolledProgram([])).toBe('Not enrolled');
  });

  test('returns fallback if registrations is null or undefined', () => {
    expect(getEnrolledProgram(null)).toBe('Not enrolled');
    expect(getEnrolledProgram(undefined)).toBe('Not enrolled');
  });

  test('returns fallback if first registration has no program', () => {
    const registrations = [{ programs: null }];
    expect(getEnrolledProgram(registrations)).toBe('Not enrolled');
  });
});