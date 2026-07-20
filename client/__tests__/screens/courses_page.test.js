import { getSlotInfo } from '../../src/screens/courses_page';

jest.mock('../../src/lib/supabase', () => ({ supabase: {} }));

describe('getSlotInfo', () => {
  test('returns slot counts formatted correctly', () => {
    const slots = [{ current_count: 2, max_capacity: 5 }];
    expect(getSlotInfo(slots)).toBe('2/5');
  });

  test('marks full slots correctly', () => {
    const slots = [{ current_count: 5, max_capacity: 5 }];
    expect(getSlotInfo(slots)).toBe('5/5 (full)');
  });

  test('handles multiple slots joined by comma', () => {
    const slots = [
      { current_count: 2, max_capacity: 5 },
      { current_count: 5, max_capacity: 5 },
    ];
    expect(getSlotInfo(slots)).toBe('2/5, 5/5 (full)');
  });

  test('returns fallback if no slots', () => {
    expect(getSlotInfo([])).toBe('No slots assigned');
    expect(getSlotInfo(null)).toBe('No slots assigned');
  });
});