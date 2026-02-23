import apiClient from './apiClient';

const startupService = {
    getStartup: (id) => apiClient.get(`/startups/${id}`),
    followStartup: (id) => apiClient.post(`/startups/${id}/follow`),
    unfollowStartup: (id) => apiClient.delete(`/startups/${id}/follow`),
    getFollowStatus: (id) => apiClient.get(`/startups/${id}/follow-status`),
};

export default startupService;
