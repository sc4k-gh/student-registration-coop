import apiClient from './api/client.js';
import { useQuery } from '@tanstack/react-query';

//Consider replacing with a dedicated test endpoint that just returns a short number or string later
test('Database and server can be queried', async () => {
  const response = await apiClient.get('/programs');

  expect(response.status).toBe(200); // Ensure no error
  expect(response.data.length).toBeGreaterThan(0); // Ensure result is non-empty
  expect(response.data).toBeInstanceOf(Array); // Ensure result is an array
  expect(response.data[0]).toHaveProperty('id'); // Ensure result matches table structure
});