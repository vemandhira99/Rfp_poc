export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('rfp_token');
  
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorDesc = response.statusText;
    try {
      const errorData = await response.json();
      errorDesc = errorData.detail || errorDesc;
    } catch(e) {}
    throw new Error(errorDesc);
  }

  return response.json();
}
