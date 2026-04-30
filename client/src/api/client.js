const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

let _getToken = null;

// Call this once at app startup to wire up the Clerk token getter.
export const setTokenGetter = (getToken) => {
  _getToken = getToken;
};

// Builds auth headers — includes Clerk JWT token if provided.
const getHeaders = async () => {
  const token = _getToken ? await _getToken() : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

const apiClient = {
  // Sends a GET request to the given endpoint.
  get: async (endpoint) =>
    fetch(`${BASE_URL}${endpoint}`, {
      headers: await getHeaders(),
    }).then((res) => res.json()),

  // Sends a POST request with a JSON body to the given endpoint.
  post: async (endpoint, body) =>
    fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(body),
    }).then((res) => res.json()),

  // Sends a PATCH request with a JSON body to the given endpoint.
  patch: async (endpoint, body) =>
    fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: await getHeaders(),
      body: JSON.stringify(body),
    }).then((res) => res.json()),

  // Sends a DELETE request to the given endpoint.
  delete: async (endpoint) =>
    fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: await getHeaders(),
    }).then((res) => res.json()),
};

export default apiClient;