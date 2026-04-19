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
  },

  // Get reels by hashtag
  getReelsByHashtag: async (hashtag, cursor = null, limit = 20) => {
    const params = new URLSearchParams({ hashtag, limit });
    if (cursor) params.append('cursor', cursor);
    return await apiClient.get(`/reels?${params.toString()}`);
  },

  // Create / publish a reel from a pitch video URL
  createReel: async ({ videoUrl, title, description, hashtags }) => {
    return await apiClient.post('/reels', { videoUrl, title, description, hashtags });
  },

  // Get all reels uploaded by the current user's startup (for profile Posts tab)
  getMyReels: async () => apiClient.get('/reels/me'),

  getPitchCount: async () => apiClient.get('/reels/pitch-count/me'),

  // Delete a reel (startup founder only)
  deleteReel: async (reelId) => apiClient.delete(`/reels/${reelId}`),

  // Get a single reel by ID (used for direct deep-links from explore)
  getReelById: async (reelId) => apiClient.get(`/reels/${reelId}`),
};

export default reelsService;
