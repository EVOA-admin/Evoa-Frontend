// API Configuration
const API_URL = import.meta.env.VITE_API_BASE_URL || '';

if (!API_URL) {
  console.warn('⚠️ VITE_API_BASE_URL not set! Add it to .env file');
}

// Auth Token Management
export const setAuthToken = (token) => {
  token ? localStorage.setItem('authToken', token) : localStorage.removeItem('authToken');
};

export const getUserData = () => {
  const data = localStorage.getItem('userData');
  return data ? JSON.parse(data) : null;
};

export const setUserData = (userData) => {
  userData ? localStorage.setItem('userData', JSON.stringify(userData)) : localStorage.removeItem('userData');
};

export const clearAuthData = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
};

// API Request Helper
const makeRequest = async (endpoint, method = 'GET', body = null, needsAuth = true) => {
  if (!API_URL) {
    throw { error: true, message: 'API URL not configured. Set VITE_API_BASE_URL in .env' };
  }

  const headers = { 'Content-Type': 'application/json' };

  if (needsAuth) {
    const token = localStorage.getItem('authToken');
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

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

    if (!response.ok) {
      // Handle 401 Unauthorized - redirect to login
      if (response.status === 401) {
        clearAuthData();
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }

      throw {
        error: true,
        status: response.status,
        message: data.message || data.error?.message || 'Request failed',
        data: data,
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

// API Client Methods
export const apiClient = {
  get: (endpoint, options = {}) => makeRequest(endpoint, 'GET', null, options.requiresAuth !== false),
  post: (endpoint, body, options = {}) => makeRequest(endpoint, 'POST', body, options.requiresAuth !== false),
  put: (endpoint, body, options = {}) => makeRequest(endpoint, 'PUT', body, options.requiresAuth !== false),
  patch: (endpoint, body, options = {}) => makeRequest(endpoint, 'PATCH', body, options.requiresAuth !== false),
  delete: (endpoint, options = {}) => makeRequest(endpoint, 'DELETE', null, options.requiresAuth !== false),
};

export default apiClient;
