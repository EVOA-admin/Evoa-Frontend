import apiClient from './apiClient';

export const reelsService = {
  // Get feed (for you or following) — uses cursor-based pagination to match backend
  getFeed: async (type = 'foryou', cursor = null, limit = 20) => {
    const params = new URLSearchParams({ type, limit });
    if (cursor) params.append('cursor', cursor);
    return await apiClient.get(`/reels?${params.toString()}`);
  },

  // Like a reel
  likeReel: async (reelId) => {
    return await apiClient.post(`/reels/${reelId}/like`);
  },

  // Unlike a reel
  unlikeReel: async (reelId) => {
    return await apiClient.delete(`/reels/${reelId}/like`);
  },

  // Save a reel
  saveReel: async (reelId) => {
    return await apiClient.post(`/reels/${reelId}/save`);
  },

  // Unsave a reel
  unsaveReel: async (reelId) => {
    return await apiClient.delete(`/reels/${reelId}/save`);
  },

  // Comment on a reel
  commentOnReel: async (reelId, content) => {
    return await apiClient.post(`/reels/${reelId}/comment`, { content });
  },

  // Get comments for a reel
  getComments: async (reelId) => {
    return await apiClient.get(`/reels/${reelId}/comments`);
  },

  // Share a reel
  shareReel: async (reelId, platform = 'copy_link') => {
    return await apiClient.post(`/reels/${reelId}/share`, { platform });
  },

  // Track a view
  trackView: async (reelId) => {
    return await apiClient.post(`/reels/${reelId}/view`);
  }
};

export default reelsService;
