import apiClient from './apiClient';

export const createInvestor = async (data) => {
    return await apiClient.post('/investors', data);
};

export const getMyInvestorProfile = async () => {
    return await apiClient.get('/investors/my');
};

export const updateInvestorProfile = async (data) => {
    return await apiClient.patch('/investors/my', data);
};

export const getPublicInvestorsDirectory = async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '' && v !== 'all') {
            query.set(k, v);
        }
    });
    const serialized = query.toString();
    return await apiClient.get(`/investors/public-directory${serialized ? `?${serialized}` : ''}`);
};

export const getPublicInvestorProfile = async (idOrUserId) => {
    return await apiClient.get(`/investors/public/${idOrUserId}`);
};

export const checkDuplicateInvestor = async (data) => {
    return await apiClient.post('/investors/check-duplicate', data);
};

export const reportCorrection = async (data) => {
    return await apiClient.post('/investors/report-correction', data);
};

// ── Claim Flow Endpoints ───────────────────────────────────────────────────

export const getClaimPrefill = async (investorId) => {
    return await apiClient.get(`/investors/claim/${investorId}/prefill`);
};

export const initiateClaim = async (investorId) => {
    return await apiClient.post('/investors/claim/initiate', { investorId });
};

export const sendWorkEmailOtp = async ({ claimId, workEmail }) => {
    return await apiClient.post('/investors/claim/send-work-email-otp', { claimId, workEmail });
};

export const verifyWorkEmailOtp = async ({ claimId, otp }) => {
    return await apiClient.post('/investors/claim/verify-work-email-otp', { claimId, otp });
};

export const getLinkedInAuthUrl = async ({ claimId, redirectUri }) => {
    return await apiClient.get(`/investors/claim/linkedin/auth-url?claimId=${encodeURIComponent(claimId)}&redirectUri=${encodeURIComponent(redirectUri)}`);
};

export const submitLinkedInCallback = async ({ claimId, code, redirectUri, state }) => {
    return await apiClient.post('/investors/claim/linkedin/callback', { claimId, code, redirectUri, state });
};

export const completeClaim = async (data) => {
    return await apiClient.post('/investors/claim/complete', data);
};

export default {
    createInvestor,
    getMyInvestorProfile,
    updateInvestorProfile,
    getPublicInvestorsDirectory,
    getPublicInvestorProfile,
    checkDuplicateInvestor,
    reportCorrection,
    getClaimPrefill,
    initiateClaim,
    sendWorkEmailOtp,
    verifyWorkEmailOtp,
    getLinkedInAuthUrl,
    submitLinkedInCallback,
    completeClaim,
};
