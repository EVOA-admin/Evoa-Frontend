const PRODUCTION_API_FALLBACK = 'https://evoa-backend.onrender.com/api';

function resolveApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (configuredUrl) {
    let trimmed = configuredUrl.trim().replace(/\/+$/, '');
    if (!trimmed.endsWith('/api')) trimmed = `${trimmed}/api`;
    return trimmed;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return PRODUCTION_API_FALLBACK;
  }
  return 'http://localhost:3000/api';
}

const API_BASE_URL = resolveApiBaseUrl();

async function handleResponse(res) {
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = Array.isArray(payload?.message) ? payload.message.join(', ') : payload?.message;
    throw new Error(msg || `Request failed with status ${res.status}`);
  }
  if (payload && typeof payload === 'object' && payload.data !== undefined) {
    return payload.data;
  }
  return payload;
}

export const eventService = {
  async getAllPublishedEvents() {
    const res = await fetch(`${API_BASE_URL}/events`);
    return handleResponse(res);
  },

  async getFeaturedEvent() {
    const res = await fetch(`${API_BASE_URL}/events/featured`);
    return handleResponse(res);
  },

  async getEventBySlug(slug) {
    const res = await fetch(`${API_BASE_URL}/events/slug/${slug}`);
    return handleResponse(res);
  },

  async getEventById(id) {
    const res = await fetch(`${API_BASE_URL}/events/id/${id}`);
    return handleResponse(res);
  },
};
