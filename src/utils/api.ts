export const API_BASE_URL = 'http://localhost:5000';

export async function apiFetch(path: string, options: RequestInit = {}) {
  const url = API_BASE_URL + path;
  const token = localStorage.getItem('token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Optional: Throw on HTTP error status
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `API error: ${response.status}`;
      throw new Error(errorMessage);
    }

    return response;
  } catch (error) {
    console.error(`apiFetch error on ${path}:`, error);
    throw error;
  }
}
