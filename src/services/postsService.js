import apiClient from './apiClient';

const postsService = {
    /** Get all recent posts — startup posts enriched with stats */
    getAllPosts: async () => apiClient.get('/posts'),

    /** Create a new post */
    createPost: async ({ imageUrl, caption, hashtags = [] }) =>
        apiClient.post('/posts', { imageUrl, caption, hashtags }),

    /** Get the current user's own posts */
    getMyPosts: async () => apiClient.get('/posts/me'),

    /** Get posts by any userId */
    getUserPosts: async (userId) => apiClient.get(`/posts/user/${userId}`),

    /** Like a post */
    likePost: async (postId) => apiClient.post(`/posts/${postId}/like`),

    /** Unlike a post */
    unlikePost: async (postId) => apiClient.delete(`/posts/${postId}/like`),

    /** Save a post (idempotent) */
    savePost: async (postId) => apiClient.post(`/posts/${postId}/save`),

    /** Unsave a post */
    unsavePost: async (postId) => apiClient.delete(`/posts/${postId}/save`),

    /** Delete a post (owner only) */
    deletePost: async (postId) => apiClient.delete(`/posts/${postId}`),

    /**
     * Record a website click — idempotent, counted only once per user.
     * Call when a user taps the startup's website link.
     */
    recordWebsiteClick: async (postId) =>
        apiClient.post(`/posts/${postId}/website-click`),

    /** Add a comment to a post */
    addComment: async (postId, content) =>
        apiClient.post(`/posts/${postId}/comments`, { content }),

    /** Get all comments on a post */
    getComments: async (postId) => apiClient.get(`/posts/${postId}/comments`),

    /** Get Investor's Thoughts — only investor/incubator comments */
    getInvestorThoughts: async (postId) =>
        apiClient.get(`/posts/${postId}/investor-thoughts`),
};

export default postsService;
