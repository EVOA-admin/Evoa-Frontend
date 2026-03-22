/**
 * analytics.js — Google Analytics 4 (GA4) helper for EVOA
 *
 * Measurement ID: G-XY11SE5CLR
 *
 * Usage:
 *   import { trackEvent, trackPageView } from './analytics';
 *
 *   trackPageView('/login');
 *   trackEvent('button_click', { button_name: 'Sign Up', page: '/home' });
 *   trackUserSignup('email');
 *   trackLogin('google');
 */

const GA_ID = 'G-XY11SE5CLR';

// ─── Core helper ──────────────────────────────────────────────────────────────

/**
 * Send any GA4 event.
 * Safe to call even before gtag is loaded — commands queue automatically.
 *
 * @param {string} eventName  - GA4 event name (snake_case recommended)
 * @param {object} [params]   - Optional event parameters
 */
export function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params);
}

/**
 * Manually send a page_view event.
 * Called automatically on every route change by GARouteTracker.
 *
 * @param {string} path      - e.g. '/login' or window.location.pathname
 * @param {string} [title]   - Optional page title
 */
export function trackPageView(path, title = document.title) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('config', GA_ID, {
    page_path:  path,
    page_title: title,
  });
}

// ─── Sample event helpers ─────────────────────────────────────────────────────

/**
 * Track a user sign-up.
 * @param {'email'|'google'|string} method - Registration method
 */
export function trackUserSignup(method = 'email') {
  trackEvent('sign_up', { method });
}

/**
 * Track a user login.
 * @param {'email'|'google'|string} method - Auth method used
 */
export function trackLogin(method = 'email') {
  trackEvent('login', { method });
}

/**
 * Track a button click with optional context.
 * @param {string} buttonName  - Human-readable button label
 * @param {string} [page]      - Page where the click occurred
 */
export function trackButtonClick(buttonName, page = window.location.pathname) {
  trackEvent('button_click', { button_name: buttonName, page });
}

/**
 * Track a role selection on the choice-role page.
 * @param {'startup'|'investor'|'incubator'|'viewer'} role
 */
export function trackRoleSelected(role) {
  trackEvent('role_selected', { role });
}

/**
 * Track a registration form submission.
 * @param {'startup'|'investor'|'incubator'|'viewer'} role
 * @param {boolean} success
 */
export function trackRegistrationSubmit(role, success = true) {
  trackEvent('registration_submit', { role, success });
}

/**
 * Track a search query on the Explore page.
 * @param {string} searchTerm
 */
export function trackSearch(searchTerm) {
  trackEvent('search', { search_term: searchTerm });
}

/**
 * Track external link clicks (e.g. LinkedIn, portfolio links).
 * @param {string} url
 * @param {string} [linkLabel]
 */
export function trackExternalLink(url, linkLabel = '') {
  trackEvent('external_link_click', { url, link_label: linkLabel });
}
