import { supabase } from '../config/supabase';

const API_URL = import.meta.env.VITE_API_BASE_URL || '';

if (!API_URL) {
  console.warn('⚠️ VITE_API_BASE_URL not set! Add it to .env file');
}

export const setAuthToken = (token) => {
  token ? localStorage.setItem('authToken', token) : localStorage.removeItem('authToken');
};

export const clearAuthData = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
};

/**
 * Get auth token. Reads from localStorage first (fast, synchronous).
 * Falls back to a live Supabase session check only when localStorage is empty.
 */
const getAuthToken = async () => {
  const cached = localStorage.getItem('authToken');
  if (cached) return cached;

  // Fallback: for OAuth redirect edge case where localStorage hasn't been set yet
  try {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.access_token) {
      localStorage.setItem('authToken', data.session.access_token);
      return data.session.access_token;
    }
  } catch (_) { /* no-op */ }
  return null;
};

/**
 * Force-refresh the Supabase session and update localStorage.
 * Used as a safety net when the backend returns 401.
 */
const refreshToken = async () => {
  try {
    const { data } = await supabase.auth.refreshSession();
    if (data?.session?.access_token) {
      localStorage.setItem('authToken', data.session.access_token);
      return data.session.access_token;
    }
  } catch (_) { /* no-op */ }
  return null;
};

const makeRequest = async (endpoint, method = 'GET', body = null, needsAuth = true, isRetry = false) => {
  if (!API_URL) {
    throw { error: true, message: 'API URL not configured. Set VITE_API_BASE_URL in .env' };
  }

  const headers = { 'Content-Type': 'application/json' };

  if (needsAuth) {
    const token = await getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const config = { method, headers };
  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);

    let data;
    try {
      data = await response.json();
    } catch {
      data = { message: await response.text() };
    }

    // 401: token may be expired — refresh and retry ONCE automatically
    if (response.status === 401 && needsAuth && !isRetry) {
      console.warn('apiClient: 401 received, attempting token refresh...');
      const newToken = await refreshToken();
      if (newToken) {
        return makeRequest(endpoint, method, body, needsAuth, true /* isRetry */);
      }
    }

    if (!response.ok) {
      throw {
        error: true,
        status: response.status,
        message: data.message || data.error?.message || 'Request failed',
        data,
      };
    }

    return { error: false, status: response.status, data };
  } catch (error) {
    if (error.error) throw error;
    throw {
      error: true,
      status: 0,
      message: error.message || 'Network error. Check your connection.',
      data: null,
    };
  }
};

export const apiClient = {
  get: (endpoint, opts = {}) => makeRequest(endpoint, 'GET', null, opts.requiresAuth !== false),
  post: (endpoint, body, opts = {}) => makeRequest(endpoint, 'POST', body, opts.requiresAuth !== false),
  put: (endpoint, body, opts = {}) => makeRequest(endpoint, 'PUT', body, opts.requiresAuth !== false),
  patch: (endpoint, body, opts = {}) => makeRequest(endpoint, 'PATCH', body, opts.requiresAuth !== false),
  delete: (endpoint, opts = {}) => makeRequest(endpoint, 'DELETE', null, opts.requiresAuth !== false),
};

export default apiClient;
