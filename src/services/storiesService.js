import apiClient from './apiClient';

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

const storiesService = {
    /**
     * Fetch all active (non-expired) stories.
     * Client-side 24h filter as a safety net in addition to server-side expiresAt.
     */
    getActiveStories: async () => {
        const res = await apiClient.get('/stories');
        const now = Date.now();
        const raw = res?.data?.data || res?.data || [];
        const filtered = Array.isArray(raw)
            ? raw.filter((s) => {
                const createdAt = new Date(s.createdAt).getTime();
                return now - createdAt < TWENTY_FOUR_HOURS_MS;
            })
            : [];
        return { ...res, data: filtered };
    },

    /** Fetch the current user's own stories */
    getMyStories: () => apiClient.get('/stories/me'),

    /**
     * Upload a story image/video via the backend (bypasses Supabase RLS).
     * Uses raw fetch so that the browser sets the correct multipart boundaries.
     */
    createStory: async (file) => {
        const token = localStorage.getItem('authToken');
        const apiBase = import.meta.env.VITE_API_BASE_URL || '';

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${apiBase}/stories/upload`, {
            method: 'POST',
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                // Do NOT set Content-Type — let the browser set it with the boundary
            },
            body: formData,
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ message: 'Upload failed' }));
            throw new Error(err.message || 'Story upload failed');
        }

        return response.json();
    },

    /** Like a story (notifies the author) */
    likeStory: (storyId) => apiClient.post(`/stories/${storyId}/like`),

    /** Delete a story by id */
    deleteStory: (storyId) => apiClient.delete(`/stories/${storyId}`),
};

export default storiesService;
