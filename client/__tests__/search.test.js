import { searchQuery } from '../src/screens/student_page.js';

//Dummy data for testing purposes
const data = [
    { id: 'student1', student_name: 'Placeholder One', parent_name: 'Placeholder Mother', parent_id: 'parent1' },
    { id: 'student2', student_name: 'TBA Two', parent_name: 'TBA Father', parent_id: 'parent2' },
    { id: 'student3', student_name: 'Temporary Three', parent_name: 'Temporary Parent', parent_id: 'parent3' }
];

describe('searchQuery', () => {
    test('Search function looks for and returns data properly', () => {
        //Should only return entry 2
        expect(searchQuery(data, 'BA', 'student_name')).toEqual([
            { id: 'student2', student_name: 'TBA Two', parent_name: 'TBA Father', parent_id: 'parent2' }
        ]);
    });

    test('Search function returns multiple results if several rows match the query', () => {
        //Should return entries 2 and 3 as both contain T in the student_name column
        expect(searchQuery(data, 'T', 'student_name')).toEqual([
            { id: 'student2', student_name: 'TBA Two', parent_name: 'TBA Father', parent_id: 'parent2' },
            { id: 'student3', student_name: 'Temporary Three', parent_name: 'Temporary Parent', parent_id: 'parent3' }
        ]);
        //Should return the entire table as all entries contain O in the student_name column
        expect(searchQuery(data, 'O', 'student_name')).toEqual([
            { id: 'student1', student_name: 'Placeholder One', parent_name: 'Placeholder Mother', parent_id: 'parent1' },
            { id: 'student2', student_name: 'TBA Two', parent_name: 'TBA Father', parent_id: 'parent2' },
            { id: 'student3', student_name: 'Temporary Three', parent_name: 'Temporary Parent', parent_id: 'parent3' }
        ]);
    });

    test('Search function recognizes search mode as the filter column', () => {
        //Should return entry 1 if search mode is recognized
        expect(searchQuery(data, '1', 'id')).toEqual([
            { id: 'student1', student_name: 'Placeholder One', parent_name: 'Placeholder Mother', parent_id: 'parent1' }
        ]);
    });

    test('Search function returns the entire table if no search term is supplied', () => {
        //If search is empty, the entire table should be returned
        expect(searchQuery(data, '', 'student_name')).toEqual([
            { id: 'student1', student_name: 'Placeholder One', parent_name: 'Placeholder Mother', parent_id: 'parent1' },
            { id: 'student2', student_name: 'TBA Two', parent_name: 'TBA Father', parent_id: 'parent2' },
            { id: 'student3', student_name: 'Temporary Three', parent_name: 'Temporary Parent', parent_id: 'parent3' }
            ]
        );
    });

    test("Search function returns an empty array if the search term doesn't match", () => {
        //If no entries match the given search term, an empty array should be returned
        expect(searchQuery(data, 'Invalid Search Term', 'student_name')).toEqual([]);
    });
});