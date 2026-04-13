// Base URL for all API requests.
// TODO: Replace with the real Render URL once the backend is deployed.
// Currently set to a local IP address for testing purposes.
// const BASE_URL = 'http://[IP_ADDRESS]:8000';
const BASE_URL = 'http://[IP_ADDRESS]:8000';

const apiClient = {
  // Sends a GET request to the given endpoint.
  get: (endpoint) =>
    fetch(`${BASE_URL}${endpoint}`).then((res) => res.json()),

  // Sends a POST request with a JSON body to the given endpoint.
  post: (endpoint, body) =>
    fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((res) => res.json()),

  // Sends a PATCH request with a JSON body to the given endpoint
  patch: (endpoint, body) =>
    fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((res) => res.json()),

  // Sends a DELETE request to the given endpoint
  delete: (endpoint) =>
    fetch(`${BASE_URL}${endpoint}`, { method: 'DELETE' }).then((res) => res.json()),
};

export default apiClient;
