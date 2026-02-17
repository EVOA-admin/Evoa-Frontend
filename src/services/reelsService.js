import apiClient from './apiClient';

export const getFeed = async (params) => {
  const { type, cursor, limit = 20 } = params;
  const queryParams = new URLSearchParams({ type, limit: limit.toString() });
  if (cursor) queryParams.append('cursor', cursor);
  return await apiClient.get(`/reels/feed?${queryParams.toString()}`);
};

export const likeReel = async (reelId) => {
  return await apiClient.post(`/reels/${reelId}/like`);
};

export const unlikeReel = async (reelId) => {
  return await apiClient.delete(`/reels/${reelId}/like`);
};

export const commentOnReel = async (reelId, commentData) => {
  return await apiClient.post(`/reels/${reelId}/comments`, commentData);
};

export const getReelComments = async (reelId) => {
  return await apiClient.get(`/reels/${reelId}/comments`);
};

export const shareReel = async (reelId, shareData) => {
  return await apiClient.post(`/reels/${reelId}/share`, shareData);
};

export const saveReel = async (reelId) => {
  return await apiClient.post(`/reels/${reelId}/save`);
};

export const unsaveReel = async (reelId) => {
  return await apiClient.delete(`/reels/${reelId}/save`);
};

export const trackView = async (reelId) => {
  try {
    return await apiClient.post(`/reels/${reelId}/view`);
  } catch (error) {
    // View tracking is non-critical, don't throw
    console.warn('Failed to track view:', error);
    return null;
  }
};

export default {
  getFeed,
  likeReel,
  unlikeReel,
  commentOnReel,
  getReelComments,
  shareReel,
  saveReel,
  unsaveReel,
  trackView,
};
