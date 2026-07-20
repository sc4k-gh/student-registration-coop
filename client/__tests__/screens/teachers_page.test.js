import { getTeacherPrograms, getTeacherTimeSlots } from '../../src/screens/teachers_page';

jest.mock('../../src/lib/supabase', () => ({ supabase: {} }));

describe('getTeacherPrograms', () => {
  test('returns program names joined by comma', () => {
    const slots = [
      { programs: { name: 'Piano Basics' } },
      { programs: { name: 'Advanced Guitar' } },
    ];
    expect(getTeacherPrograms(slots)).toBe('Piano Basics, Advanced Guitar');
  });

  test('filters out slots with no program', () => {
    const slots = [
      { programs: { name: 'Piano Basics' } },
      { programs: null },
    ];
    expect(getTeacherPrograms(slots)).toBe('Piano Basics');
  });

  test('returns fallback if no slots', () => {
    expect(getTeacherPrograms([])).toBe('No courses assigned');
    expect(getTeacherPrograms(null)).toBe('No courses assigned');
  });
});

describe('getTeacherTimeSlots', () => {
  test('returns formatted day and time joined by comma', () => {
    const slots = [
      { day_of_week: 'mon', start_time: '17:00', end_time: '18:00' },
      { day_of_week: 'wed', start_time: '16:00', end_time: '17:00' },
    ];
    expect(getTeacherTimeSlots(slots)).toBe('mon 17:00-18:00, wed 16:00-17:00');
  });

  test('returns fallback if no slots', () => {
    expect(getTeacherTimeSlots([])).toBe('No time slots assigned');
    expect(getTeacherTimeSlots(null)).toBe('No time slots assigned');
  });
});