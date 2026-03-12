import apiClient from './apiClient';

// ─── Support (for Startups) ───────────────────────────────────────────────────

/** Support a startup */
export const supportStartup = (startupId) =>
    apiClient.post(`/startups/${startupId}/follow`);

/** Remove support from a startup */
export const unsupportStartup = (startupId) =>
    apiClient.delete(`/startups/${startupId}/follow`);

/** Check if current user supports a startup */
export const getSupportStatus = (startupId) =>
    apiClient.get(`/startups/${startupId}/follow-status`);

/** Get list of supporters for a startup */
export const getSupporters = (startupId) =>
    apiClient.get(`/startups/${startupId}/supporters`);

// ─── Follow (for Investors / Incubators / Viewers) ───────────────────────────

/** Toggle follow/unfollow a user */
export const followUser = (userId) =>
    apiClient.post(`/users/${userId}/connect`);

/** Alias for followUser */
export const unfollowUser = followUser;

/** Check if current user follows another user */
export const getFollowStatus = (userId) =>
    apiClient.get(`/users/${userId}/follow-status`);

/** Get followers of a user */
export const getFollowers = (userId) =>
    apiClient.get(`/users/${userId}/followers`);

/** Get list of users that userId is following */
export const getFollowing = (userId) =>
    apiClient.get(`/users/${userId}/following`);

// ─── Chat / Messages ─────────────────────────────────────────────────────────

/** Send a direct message to a user */
export const sendMessage = (toUserId, content) =>
    apiClient.post('/chat/send', { toUserId, content });

/** Get all conversations */
export const getConversations = () =>
    apiClient.get('/chat/conversations');

/** Get messages in a conversation */
export const getMessages = (conversationId) =>
    apiClient.get(`/chat/conversations/${conversationId}/messages`);

/** Send a message request when direct DM is restricted */
export const sendMessageRequest = (toUserId, message = '') =>
    apiClient.post('/chat/request', { toUserId, message });

/** Get incoming message requests */
export const getMessageRequests = () =>
    apiClient.get('/chat/requests');

/** Accept or ignore a message request */
export const respondToRequest = (requestId, action) =>
    apiClient.patch(`/chat/requests/${requestId}`, { action });

/** Get unread messages + pending request count */
export const getUnreadCount = () =>
    apiClient.get('/chat/unread-count');

/** Check messaging permission with a user */
export const getPermission = (userId) =>
    apiClient.get(`/chat/permission/${userId}`);

/** Find or create conversation with a user */
export const getConversationWith = (userId) =>
    apiClient.get(`/chat/conversation-with/${userId}`);

export default {
    supportStartup, unsupportStartup, getSupportStatus, getSupporters,
    followUser, unfollowUser, getFollowStatus, getFollowers, getFollowing,
    sendMessage, getConversations, getMessages, sendMessageRequest,
    getMessageRequests, respondToRequest, getUnreadCount,
    getPermission, getConversationWith,
};
