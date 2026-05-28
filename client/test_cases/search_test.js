import { searchQuery } from './studentSearch';

const searchMode = 'student_name';
const search = 'BA';
//Dummy data for testing purposes
const data = [
    { id: 'student1', student_name: 'Placeholder One', parent_name: 'Placeholder Mother', parent_id: 'parent1' },
    { id: 'student2', student_name: 'TBA Two', parent_name: 'TBA Father', parent_id: 'parent2' },
    { id: 'student3', student_name: 'Temporary Three', parent_name: 'Temporary Parent', parent_id: 'parent3' }
];

describe('searchQuery', () => {
    test('Search function looks for and returns data properly', () => {
        expect(searchQuery(data, search, searchMode)).toEqual([
            {id: 'student2', student_name: 'TBA Two', parent_name: 'TBA Father', parent_id: 'parent2'}
        ]);
    });

    test('Search function returns multiple results if several rows match the query', () => {
        expect(searchQuery(data, 'T', searchMode)).toEqual([
            {id: 'student2', student_name: 'TBA Two', parent_name: 'TBA Father', parent_id: 'parent2'},
            { id: 'student3', student_name: 'Temporary Three', parent_name: 'Temporary Parent', parent_id: 'parent3' }
        ]);
    });

    test('Search function uses searchMode as the filter column', () => {
        expect(searchQuery(data, '1', 'id')).toEqual([
            { id: 'student1', student_name: 'Placeholder One', parent_name: 'Placeholder Mother', parent_id: 'parent1' }
        ]);
    });

    test('Search function returns the entire table if no search term is supplied', () => {
        expect(searchQuery(data, undefined, searchMode)).toEqual([[
            { id: 'student1', student_name: 'Placeholder One', parent_name: 'Placeholder Mother', parent_id: 'parent1' },
            { id: 'student2', student_name: 'TBA Two', parent_name: 'TBA Father', parent_id: 'parent2' },
            { id: 'student3', student_name: 'Temporary Three', parent_name: 'Temporary Parent', parent_id: 'parent3' }
            ]
        ]);
    });

    test("Search function returns an empty array if the search term doesn't match", () => {
        expect(searchQuery(data, 'Invalid Search Term', searchMode)).toEqual([]);
    });
});