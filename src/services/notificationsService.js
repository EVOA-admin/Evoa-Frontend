import apiClient from './apiClient';

export const getNotifications = async (params = {}) => {
  const { type } = params;
  const endpoint = type ? `/notifications?type=${type}` : '/notifications';
  return await apiClient.get(endpoint);
};

export const markNotificationAsRead = async (notificationId) => {
  return await apiClient.post(`/notifications/${notificationId}/read`);
};

export const markAllNotificationsAsRead = async () => {
  return await apiClient.post('/notifications/read-all');
};

// ── Web Push Notification API Methods ────────────────────────────────────────

export const registerPushToken = async ({ token, deviceType = 'web', userAgent }) => {
  return await apiClient.post('/notifications/push/register', {
    token,
    deviceType,
    userAgent: userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : undefined),
  });
};

export const unregisterPushToken = async (token) => {
  return await apiClient.post('/notifications/push/unregister', { token });
};

export const getPushStatus = async () => {
  return await apiClient.get('/notifications/push/status');
};

export const sendTestPush = async () => {
  return await apiClient.post('/notifications/push/test');
};

export default {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  registerPushToken,
  unregisterPushToken,
  getPushStatus,
  sendTestPush,
};
