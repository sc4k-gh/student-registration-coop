import { flattenRegistrations } from '../../../src/screens/parent/my_registrations';

jest.mock('../../../src/lib/supabase', () => ({ supabase: {} }));

describe('flattenRegistrations', () => {
  test('returns empty array if data is null or undefined', () => {
    expect(flattenRegistrations(null)).toEqual([]);
    expect(flattenRegistrations(undefined)).toEqual([]);
  });

  test('returns empty array if students have no registrations', () => {
    const data = [{ student_name: 'John', age: 10, registrations: [] }];
    expect(flattenRegistrations(data)).toEqual([]);
  });

  test('flattens registrations and includes student name and age', () => {
    const data = [{
      student_name: 'John Doe',
      age: 10,
      registrations: [{ id: '1', status: 'pending', programs: { name: 'Piano' } }]
    }];
    const result = flattenRegistrations(data);
    expect(result).toHaveLength(1);
    expect(result[0].student_name).toBe('John Doe');
    expect(result[0].student_age).toBe(10);
    expect(result[0].status).toBe('pending');
  });

  test('flattens multiple students with multiple registrations', () => {
    const data = [
      { student_name: 'John', age: 10, registrations: [{ id: '1' }, { id: '2' }] },
      { student_name: 'Jane', age: 8, registrations: [{ id: '3' }] },
    ];
    expect(flattenRegistrations(data)).toHaveLength(3);
  });
});