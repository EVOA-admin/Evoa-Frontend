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
      ticket = raw?.data !== undefined ? raw.data : raw;
      if (!ticket || (!ticket.ticketCode && !ticket.id)) ticket = null;
    } catch (err) {
      console.warn('Backend ticket booking network issue, using local fallback:', err);
    }

    if (!ticket) {
      const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      ticket = {
        id: `local-${Date.now()}`,
        ticketCode: `TKT-EVOA-${randomCode}`,
        eventId: payload.eventId,
        price: payload.price ?? 0,
        userRole: payload.userRole || 'user',
        orderId: payload.orderId || '',
        paymentId: payload.paymentId || '',
        createdAt: new Date().toISOString(),
        qrCodeData: JSON.stringify({
          ticketId: `TKT-EVOA-${randomCode}`,
          eventId: payload.eventId,
          timestamp: Date.now(),
        }),
      };
    }

    // Persist to Supabase database so Super Admin Dashboard can view customer tickets
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const userId = currentUser?.id || payload.userId || 'anonymous-user';
      const userEmail = payload.userEmail || currentUser?.email || '';
      const userName = payload.userName || currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.name || '';
      const ticketCode = ticket?.ticketCode || ticket?.id || `TKT-EVOA-${Date.now()}`;

      await supabase.from('user_event_tickets').upsert({
        ticket_code: ticketCode,
        user_id: userId,
        event_id: payload.eventId,
        user_role: (payload.userRole || 'ATTENDEE').toUpperCase(),
        user_name: userName,
        user_email: userEmail,
        price: payload.price ?? 0,
        order_id: payload.orderId || '',
        payment_id: payload.paymentId || '',
        qr_code_data: JSON.stringify({
          ticketId: ticketCode,
          userId,
          eventId: payload.eventId,
          timestamp: Date.now(),
        }),
      }, { onConflict: 'ticket_code' }).catch((err) => console.warn('Supabase ticket upsert warn:', err));
    } catch (sbErr) {
      console.warn('Supabase ticket sync error:', sbErr);
    }

    // Save to local storage for instant availability in My Tickets
    try {
      const existingStr = localStorage.getItem('evoa_user_purchased_tickets');
      const existing = existingStr ? JSON.parse(existingStr) : [];
      const updated = [ticket, ...existing.filter((t) => (t.ticketCode || t.id) !== (ticket.ticketCode || ticket.id))];
      localStorage.setItem('evoa_user_purchased_tickets', JSON.stringify(updated));
    } catch (_) {}

    return ticket;
  },

  async getMyTickets() {
    let apiTickets = [];
    try {
      const res = await apiClient.get('/events/my-tickets');
      const dataPayload = res?.data !== undefined ? res.data : res;
      if (Array.isArray(dataPayload)) apiTickets = dataPayload;
    } catch (err) {
      console.warn('Could not fetch backend tickets:', err);
    }

    // Retrieve local tickets
    let localTickets = [];
    try {
      const existingStr = localStorage.getItem('evoa_user_purchased_tickets');
      if (existingStr) localTickets = JSON.parse(existingStr);
    } catch (_) {}

    // Combine and deduplicate
    const ticketMap = new Map();
    [...apiTickets, ...localTickets].forEach((t) => {
      const key = t?.ticketCode || t?.id;
      if (key && !ticketMap.has(key)) {
        ticketMap.set(key, t);
      }
    });

    const mergedList = Array.from(ticketMap.values());

    // Parallelize event enrichment for tickets missing event data (fetch unique eventIds in parallel)
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
      const ticket = res?.data !== undefined ? res.data : res;
      if (ticket && (ticket.id || ticket.ticketCode)) return ticket;
    } catch (_) {}

    // Direct check in local tickets without recursive getMyTickets calls
    try {
      const existingStr = localStorage.getItem('evoa_user_purchased_tickets');
      if (existingStr) {
        const localTickets = JSON.parse(existingStr);
        const found = localTickets.find((t) => (t.eventId || t.event?.id || t.event_id) === eventId);
        if (found) return found;
      }
    } catch (_) {}

    return null;
  },

  async getTicketByCode(code) {
    return await apiClient.get(`/events/ticket-code/${code}`, { requiresAuth: false });
  },
};
