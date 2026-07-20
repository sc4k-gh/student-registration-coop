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

// Throws on a non-2xx response so callers never receive an error body where they
// expect data — react-query surfaces the throw as isError instead of handing a
// `{ error }` object to code that expects an array.
const request = async (endpoint, options = {}) => {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: await getHeaders(),
  });

  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      // Non-JSON body (e.g. an HTML 404 page from an unmounted route).
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      throw new Error('Server returned a malformed response');
    }
  }

  if (!response.ok) {
    throw new Error(payload?.error ?? `${response.status} ${response.statusText}`);
  }
  return payload;
};

const apiClient = {
  get: (endpoint) => request(endpoint),

  post: (endpoint, body) =>
    request(endpoint, { method: 'POST', body: JSON.stringify(body) }),

  patch: (endpoint, body) =>
    request(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),

  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

export default apiClient;
