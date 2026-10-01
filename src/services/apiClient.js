import { supabase } from '../config/supabase';

const normalizeApiUrl = (rawUrl) => {
  if (!rawUrl) return '';

  const trimmedUrl = rawUrl.trim().replace(/\/+$/, '');
  if (!trimmedUrl) return '';

  if (/^https?:\/\//i.test(trimmedUrl)) {
    try {
      const parsedUrl = new URL(trimmedUrl);
      parsedUrl.pathname = parsedUrl.pathname.replace(/\/+$/, '');

      if (!parsedUrl.pathname || parsedUrl.pathname === '/') {
        parsedUrl.pathname = '/api';
      } else if (!parsedUrl.pathname.endsWith('/api')) {
        parsedUrl.pathname = `${parsedUrl.pathname}/api`;
      }

      return parsedUrl.toString().replace(/\/+$/, '');
    } catch {
      return trimmedUrl;
    }
  }

  if (trimmedUrl === '/api' || trimmedUrl.endsWith('/api')) {
    return trimmedUrl;
  }

  return `${trimmedUrl}/api`;
};

function resolveApiUrl() {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (configuredUrl) {
    return normalizeApiUrl(configuredUrl);
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://evoa-backend.onrender.com/api';
  }
  return 'http://localhost:3000/api';
}

const API_URL = resolveApiUrl();

export const setAuthToken = (token) => {
  token ? localStorage.setItem('authToken', token) : localStorage.removeItem('authToken');
};

export const clearAuthData = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
};

export const setUserData = (userData) => {
  if (userData) {
    localStorage.setItem('userData', JSON.stringify(userData));
    return;
  }

  localStorage.removeItem('userData');
};

const syncStoredToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
    return token;
  }

  localStorage.removeItem('authToken');
  return null;
};

/**
 * Get auth token. Always prefer the live Supabase session so stale cached tokens
 * don't survive environment or base-URL changes.
 */
const getAuthToken = async () => {
  try {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.access_token) {
      return syncStoredToken(data.session.access_token);
    }

    const refreshedToken = await refreshToken();
    if (refreshedToken) {
      return refreshedToken;
    }

    syncStoredToken(null);
    return null;
  } catch (_) { /* no-op */ }

  return localStorage.getItem('authToken');
};

/**
 * Force-refresh the Supabase session and update localStorage.
 * Used as a safety net when the backend returns 401.
 */
const refreshToken = async () => {
  try {
    const { data } = await supabase.auth.refreshSession();
    if (data?.session?.access_token) {
      return syncStoredToken(data.session.access_token);
    }
  } catch (_) { /* no-op */ }
  syncStoredToken(null);
  return null;
};

const makeRequest = async (endpoint, method = 'GET', body = null, needsAuth = true, isRetry = false, opts = {}) => {
  if (!API_URL) {
    throw { error: true, message: 'API URL not configured. Set VITE_API_BASE_URL in .env' };
  }

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const headers = {};

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (opts.headers) {
    Object.assign(headers, opts.headers);
    if (isFormData && headers['Content-Type']?.includes('multipart/form-data')) {
      delete headers['Content-Type'];
    }
  }

  if (needsAuth) {
    const token = await getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else if (!isRetry) {
      const refreshedToken = await refreshToken();
      if (refreshedToken) {
        headers.Authorization = `Bearer ${refreshedToken}`;
      }
    }
  }

  if (opts.onUploadProgress && typeof XMLHttpRequest !== 'undefined') {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, `${API_URL}${endpoint}`);

      Object.entries(headers).forEach(([key, val]) => {
        xhr.setRequestHeader(key, val);
      });

      if (xhr.upload) {
        xhr.upload.onprogress = (evt) => {
          opts.onUploadProgress(evt);
        };
      }

      xhr.onload = () => {
        let data;
        try {
          data = JSON.parse(xhr.responseText);
        } catch {
          data = { message: xhr.responseText };
        }

        if (xhr.status === 401 && needsAuth && !isRetry) {
          syncStoredToken(null);
          refreshToken().then((newToken) => {
            if (newToken) {
              makeRequest(endpoint, method, body, needsAuth, true, opts).then(resolve).catch(reject);
            } else {
              reject({
                error: true,
                status: xhr.status,
                message: data.message || data.error?.message || 'Request failed',
                data,
              });
            }
          }).catch(() => {
            reject({
              error: true,
              status: xhr.status,
              message: data.message || data.error?.message || 'Request failed',
              data,
            });
          });
          return;
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ error: false, status: xhr.status, data });
        } else {
          reject({
            error: true,
            status: xhr.status,
            message: data.message || data.error?.message || 'Request failed',
            data,
          });
        }
      };

      xhr.onerror = () => {
        reject({
          error: true,
          status: 0,
          message: 'Network error during upload. Check your connection.',
          data: null,
        });
      };

      if (isFormData) {
        xhr.send(body);
      } else if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
        xhr.send(typeof body === 'string' ? body : JSON.stringify(body));
      } else {
        xhr.send();
      }
    });
  }

  const config = { method, headers };
  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    config.body = isFormData ? body : (typeof body === 'string' ? body : JSON.stringify(body));
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
      syncStoredToken(null);
      console.warn('apiClient: 401 received, attempting token refresh...');
      const newToken = await refreshToken();
      if (newToken) {
        return makeRequest(endpoint, method, body, needsAuth, true /* isRetry */, opts);
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
  get: (endpoint, opts = {}) => makeRequest(endpoint, 'GET', null, opts.requiresAuth !== false, false, opts),
  post: (endpoint, body, opts = {}) => makeRequest(endpoint, 'POST', body, opts.requiresAuth !== false, false, opts),
  put: (endpoint, body, opts = {}) => makeRequest(endpoint, 'PUT', body, opts.requiresAuth !== false, false, opts),
  patch: (endpoint, body, opts = {}) => makeRequest(endpoint, 'PATCH', body, opts.requiresAuth !== false, false, opts),
  delete: (endpoint, opts = {}) => makeRequest(endpoint, 'DELETE', null, opts.requiresAuth !== false, false, opts),
};

export default apiClient;
