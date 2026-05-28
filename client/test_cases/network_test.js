import apiClient from '../src/api/client.js';

//Consider replacing with a dedicated test endpoint that just returns a short number or string later
test('Database can be queried and return the expected data', async () => {
  const response = await apiClient.get('/programs');

  expect(response.status).toBe(200); // Ensure no error
  expect(response.data.length).toBeGreaterThan(0); // Ensure result is non-empty
  expect(response.data).toBeInstanceOf(Array); // Ensure result is an array

  // Ensure result matches table structure
  expect(response.data[0]).toHaveProperty('id');
  expect(response.data[0]).toHaveProperty('level');
  expect(response.data[0]).toHaveProperty('target_age');
  expect(response.data[0]).toHaveProperty('status');
});

//An invalid endpoint should return a 404 error
test('API returns an error for invalid endpoint', async () => {
  const response = await apiClient.get('/invalidendpoint');
  expect(response.status).toBe(404); // Ensure 404 error
});

test('API returns an error for invalid endpoint', async () => {
  const response = await apiClient.get('/invalidendpoint');
  expect(response.status).toBe(404); // Ensure 404 error
});