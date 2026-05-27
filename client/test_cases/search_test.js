import { searchQuery } from './studentSearch';

const searchMode = 'student_name';
const search = 'TBA';
//Dummy data for testing purposes
const data = [
    { id: 'student1', student_name: 'Placeholder One', parent_name: 'Placeholder Mother', parent_id: 'parent1' },
    { id: 'student2', student_name: 'TBA Two', parent_name: 'TBA Father', parent_id: 'parent2' },
    { id: 'student3', student_name: 'Temporary Three', parent_name: 'Temporary Parent', parent_id: 'parent3' },
];

describe('searchQuery', () => {
    test('Search function looks for and returns data properly', () => {
        expect(searchQuery()).toEqual([{id: 'student2', student_name: 'TBA Two', parent_name: 'TBA Father', parent_id: 'parent2'}]);
    });

});