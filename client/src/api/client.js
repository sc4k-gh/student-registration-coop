const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

let _getToken = null;

// Wired up once in App.js to a function that returns the current Supabase JWT.
export const setTokenGetter = (getToken) => {
  _getToken = getToken;
};

const getHeaders = async () => {
  const token = _getToken ? await _getToken() : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const apiClient = {
  get: async (endpoint) =>
    fetch(`${BASE_URL}${endpoint}`, { headers: await getHeaders() }).then((r) => r.json()),

  post: async (endpoint, body) =>
    fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(body),
    }).then((r) => r.json()),

  patch: async (endpoint, body) =>
    fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: await getHeaders(),
      body: JSON.stringify(body),
    }).then((r) => r.json()),

  delete: async (endpoint) =>
    fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: await getHeaders(),
    }).then((r) => r.json()),
};

export default apiClient;
