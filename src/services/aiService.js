import apiClient from './apiClient';

/**
 * Ask the Investor AI a question about a specific startup.
 * @param {string} startupId - UUID of the startup being viewed
 * @param {string} question  - The investor's natural-language question
 * @returns {{ answer: string, source: string, canAskFounder: boolean }}
 */
export const askStartupAI = (startupId, question) =>
    apiClient.post('/ai/ask', { startupId, question });

export default { askStartupAI };
