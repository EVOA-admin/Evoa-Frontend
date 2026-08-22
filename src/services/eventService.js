import apiClient from './apiClient';
import { supabase } from '../config/supabase';

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

  async bookTicket(payload) {
    let ticket = null;
    try {
      const raw = await apiClient.post('/events/book-ticket', payload);
      let resData = raw?.data !== undefined ? raw.data : raw;
      if (resData?.data !== undefined) resData = resData.data;
      if (resData?.data !== undefined) resData = resData.data;

      if (resData && (resData.ticketCode || resData.ticket_code || resData.id)) {
        ticket = resData;
        const code = ticket.ticketCode || ticket.ticket_code || ticket.id;
        ticket.ticketCode = code;
        ticket.ticket_code = code;
      }
    } catch (err) {
      console.warn('Backend ticket booking API warning, attempting to fetch existing ticket from DB:', err);
      try {
        ticket = await this.getUserTicketForEvent(payload.eventId);
      } catch (_) {}
    }

    if (!ticket && payload.eventId) {
      try {
        ticket = await this.getUserTicketForEvent(payload.eventId);
      } catch (_) {}
    }

    if (ticket) {
      const finalPassCode = ticket.ticketCode || ticket.ticket_code || ticket.id;
      ticket.ticketCode = finalPassCode;
      ticket.ticket_code = finalPassCode;

      // Update local storage cache with canonical backend ticket
      try {
        const existingStr = localStorage.getItem('evoa_user_purchased_tickets');
        const existing = existingStr ? JSON.parse(existingStr) : [];
        const updated = [
          ticket,
          ...existing.filter((t) => (t.eventId || t.event_id) !== payload.eventId && (t.ticketCode || t.ticket_code || t.id) !== finalPassCode && !String(t.id).startsWith('local-')),
        ];
        localStorage.setItem('evoa_user_purchased_tickets', JSON.stringify(updated));
      } catch (_) {}
    }

    return ticket;
  },

  async getMyTickets() {
    let apiTickets = [];
    let fetchSuccess = false;
    try {
      const res = await apiClient.get('/events/my-tickets');
      let dataPayload = res?.data !== undefined ? res.data : res;
      if (dataPayload?.data !== undefined) dataPayload = dataPayload.data;
      if (dataPayload?.data !== undefined) dataPayload = dataPayload.data;
      if (Array.isArray(dataPayload)) {
        apiTickets = dataPayload;
        fetchSuccess = true;
      }
    } catch (err) {
      console.warn('Could not fetch backend tickets:', err);
    }

    // Normalize API tickets
    const ticketMap = new Map();
    apiTickets.forEach((t) => {
      const code = t?.ticketCode || t?.ticket_code || t?.id;
      const eId = t.eventId || t.event_id || t.event?.id;
      if (code) {
        t.ticketCode = code;
        t.ticket_code = code;
        const key = eId ? `evt_${eId}` : code;
        if (!ticketMap.has(key)) {
          ticketMap.set(key, t);
        }
      }
    });

    // Only merge local tickets if API fetch failed, and ignore any legacy fake local tickets
    if (!fetchSuccess) {
      try {
        const existingStr = localStorage.getItem('evoa_user_purchased_tickets');
        if (existingStr) {
          const localTickets = JSON.parse(existingStr);
          localTickets.forEach((t) => {
            if (t?.id && String(t.id).startsWith('local-')) return; // Ignore legacy local fake codes
            const code = t?.ticketCode || t?.ticket_code || t?.id;
            const eId = t.eventId || t.event_id || t.event?.id;
            const key = eId ? `evt_${eId}` : code;
            if (code && !ticketMap.has(key)) {
              t.ticketCode = code;
              t.ticket_code = code;
              ticketMap.set(key, t);
            }
          });
        }
      } catch (_) {}
    }

    const mergedList = Array.from(ticketMap.values());

    // Parallelize event enrichment for tickets missing event data
    const missingEventTickets = mergedList.filter((t) => !t.event && (t.eventId || t.event_id));
    if (missingEventTickets.length > 0) {
      const uniqueEventIds = [...new Set(missingEventTickets.map((t) => t.eventId || t.event_id))];
      const eventCache = {};
      await Promise.all(
        uniqueEventIds.map(async (eId) => {
          try {
            const evtData = await this.getEventById(eId);
            if (evtData) eventCache[eId] = evtData;
          } catch (_) {}
        })
      );
      mergedList.forEach((t) => {
        const eId = t.eventId || t.event_id;
        if (!t.event && eId && eventCache[eId]) {
          t.event = eventCache[eId];
        }
      });
    }

    try {
      localStorage.setItem('evoa_user_purchased_tickets', JSON.stringify(mergedList));
    } catch (_) {}

    return mergedList;
  },

  async getUserTicketForEvent(eventId) {
    if (!eventId) return null;
    try {
      const res = await apiClient.get(`/events/user-ticket/${eventId}`);
      let ticket = res?.data !== undefined ? res.data : res;
      if (ticket?.data !== undefined) ticket = ticket.data;
      if (ticket?.data !== undefined) ticket = ticket.data;

      if (ticket && (ticket.id || ticket.ticketCode || ticket.ticket_code)) {
        const code = ticket.ticketCode || ticket.ticket_code || ticket.id;
        ticket.ticketCode = code;
        ticket.ticket_code = code;
        return ticket;
      }
    } catch (_) {}

    // Direct check in local tickets without recursive getMyTickets calls
    try {
      const existingStr = localStorage.getItem('evoa_user_purchased_tickets');
      if (existingStr) {
        const localTickets = JSON.parse(existingStr);
        const found = localTickets.find((t) => (t.eventId || t.event?.id || t.event_id) === eventId);
        if (found) {
          const code = found.ticketCode || found.ticket_code || found.id;
          found.ticketCode = code;
          found.ticket_code = code;
          return found;
        }
      }
    } catch (_) {}

    return null;
  },

  async getTicketByCode(code) {
    return await apiClient.get(`/events/ticket-code/${code}`, { requiresAuth: false });
  },

  async resendPass(ticketId) {
    return await apiClient.post(`/events/resend-pass/${ticketId}`);
  },
};
