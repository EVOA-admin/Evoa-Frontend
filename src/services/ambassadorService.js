import apiClient from './apiClient';

/**
 * GET /ambassador/me
 * Returns the current user's ambassador dashboard:
 *   { code, totalReferrals, referrals: [{ id, fullName, avatarUrl, role, status, joinedAt }] }
 */
export const getAmbassadorDashboard = async () => {
  return apiClient.get('/ambassador/me');
};

/**
 * POST /ambassador/validate
 * Public (no auth token required) — checks if a referral code is valid.
 * Returns { valid: boolean, referrerId?: string }
 */
export const validateReferralCode = async (code) => {
  return apiClient.post(
    '/ambassador/validate',
    { referralCode: code.toUpperCase().trim() },
    { requiresAuth: false },
  );
};

/**
 * POST /ambassador/apply
 * Called right after a new user's first login.
 * Links the new user to their referrer permanently.
 */
export const applyReferralCode = async (code) => {
  return apiClient.post('/ambassador/apply', {
    referralCode: code.toUpperCase().trim(),
  });
};

export default {
  getAmbassadorDashboard,
  validateReferralCode,
  applyReferralCode,
};
