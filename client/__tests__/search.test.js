import { searchQuery } from '../src/screens/student_page.js';

const searchMode = 'student_name';
const search = 'BA';
const searchTerm = 'student_name';
//Dummy data for testing purposes
const data = [
    { id: 'student1', student_name: 'Placeholder One', parent_name: 'Placeholder Mother', parent_id: 'parent1' },
    { id: 'student2', student_name: 'TBA Two', parent_name: 'TBA Father', parent_id: 'parent2' },
    { id: 'student3', student_name: 'Temporary Three', parent_name: 'Temporary Parent', parent_id: 'parent3' }
];

describe('searchQuery', () => {
    test('Search function looks for and returns data properly', () => {
        expect(searchQuery(data, search, searchMode)).toEqual([
            // Should only return entry 2
            { id: 'student2', student_name: 'TBA Two', parent_name: 'TBA Father', parent_id: 'parent2' }
        ]);
    });

    test('Search function returns multiple results if several rows match the query', () => {
        expect(searchQuery(data, 'T', searchMode)).toEqual([
            // Should return entries 2 and 3 as both contain T in the student_name column
            { id: 'student2', student_name: 'TBA Two', parent_name: 'TBA Father', parent_id: 'parent2' },
            { id: 'student3', student_name: 'Temporary Three', parent_name: 'Temporary Parent', parent_id: 'parent3' }
        ]);
        expect(searchQuery(data, 'O', searchMode)).toEqual([
            // Should return the entire table as all entries contain O in the student_name column
            { id: 'student1', student_name: 'Placeholder One', parent_name: 'Placeholder Mother', parent_id: 'parent1' },
            { id: 'student2', student_name: 'TBA Two', parent_name: 'TBA Father', parent_id: 'parent2' },
            { id: 'student3', student_name: 'Temporary Three', parent_name: 'Temporary Parent', parent_id: 'parent3' }
        ]);
    });

    test('Search function uses searchMode as the filter column', () => {
        expect(searchQuery(data, '1', 'id')).toEqual([
            // Should return entry 1 if searchMode is working properly
            { id: 'student1', student_name: 'Placeholder One', parent_name: 'Placeholder Mother', parent_id: 'parent1' }
        ]);
    });

    test('Search function returns the entire table if no search term is supplied', () => {
        expect(searchQuery(data, '', searchMode)).toEqual([
            // If search is empty, the entire table should be returned
            { id: 'student1', student_name: 'Placeholder One', parent_name: 'Placeholder Mother', parent_id: 'parent1' },
            { id: 'student2', student_name: 'TBA Two', parent_name: 'TBA Father', parent_id: 'parent2' },
            { id: 'student3', student_name: 'Temporary Three', parent_name: 'Temporary Parent', parent_id: 'parent3' }
            ]
        );
    });

    test("Search function returns an empty array if the search term doesn't match", () => {
        // If no entires match the given search term, an empty array should be returned
        expect(searchQuery(data, 'Invalid Search Term', searchMode)).toEqual([]);
    });
});