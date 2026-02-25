import apiClient from './apiClient';

const postsService = {
    /** Get all recent posts (public explore feed) */
    getAllPosts: async () => {
        return apiClient.get('/posts');
    },

    /** Create a new post (image + caption + hashtags) */
    createPost: async ({ imageUrl, caption, hashtags = [] }) => {
        return apiClient.post('/posts', { imageUrl, caption, hashtags });
    },

    /** Get the current user's own posts */
    getMyPosts: async () => {
        return apiClient.get('/posts/me');
    },

    /** Get posts by any userId */
    getUserPosts: async (userId) => {
        return apiClient.get(`/posts/user/${userId}`);
    },

    /** Like a post */
    likePost: async (postId) => {
        return apiClient.post(`/posts/${postId}/like`);
    },

    /** Unlike a post */
    unlikePost: async (postId) => {
        return apiClient.delete(`/posts/${postId}/like`);
    },
};

export default postsService;
