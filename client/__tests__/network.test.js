import apiClient from '../src/api/client.js';

//Mocks
jest.mock('@react-native-picker/picker', () => {
  const React = require('react');
  const Picker = ({ children }) => React.createElement('div', null, children);
  Picker.Item = ({ label }) => React.createElement('span', null, label);
  return { Picker };
});

//useNavigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

//fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

/*
//Commented out until corresponding endpoint is implemented: Improved basic database test.
//Should return results directly instead of fetching from Supabase
//For the sake of verifying whether an issue lies with the database or the API.

test('Database can be queried', async () => {
  const response = await apiClient.get('/test'); // Dedicated endpoint TBA

  expect(response.status).toBe(200); // Ensure no error
  expect(response.data).toBe('Test successful'); // Ensure result is non-empty
});
*/

test('Supabase can be queried and return the expected data', async () => {
  const response = await apiClient.get('/programs');

  expect(response.status).toBe(200); // Ensure no error
  expect(response.data.length).toBeGreaterThan(0); // Ensure result is non-empty
  expect(response.data).toBeInstanceOf(Array); // Ensure result is an array

  // Ensure result matches table structure
  expect(response.data[0]).toHaveProperty('id'); // Ensure ID column exists
  expect(response.data[0]).toHaveProperty('level'); // Ensure level column exists
  expect(response.data[0]).toHaveProperty('target_age'); // Ensure target_age column exists
  expect(response.data[0]).toHaveProperty('status'); // Ensure status column exists
});

//An invalid endpoint should return a 404 error
test('API returns a 404 error for an invalid endpoint', async () => {
  const response = await apiClient.get('/invalidendpoint');
  expect(response.status).toBe(404); // Ensure 404 error
});

//Auth restricted endpoints should return a 401 error if access is attempted without a proper role
test('API returns a 401 error if endpoint is accessed without necessary authorization', async () => {
  const response = await apiClient.get('/students');
  expect(response.status).toBe(401); // Ensure 401 error
});