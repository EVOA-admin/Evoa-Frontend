import apiClient from './apiClient';

export const getStartupDetails = async (startupId) => {
  return await apiClient.get(`/startups/${startupId}`);
};

export const followStartup = async (startupId) => {
  return await apiClient.post(`/startups/${startupId}/follow`);
};

export const unfollowStartup = async (startupId) => {
  return await apiClient.delete(`/startups/${startupId}/follow`);
};

export const getFollowedStartups = async () => {
  return await apiClient.get('/startups/following/me');
};

export const createStartup = async (data) => {
  return await apiClient.post('/startups', data);
};

export const getMyStartup = async () => {
  return await apiClient.get('/startups/my');
};

export const updateStartup = async (startupId, data) => {
  return await apiClient.patch(`/startups/${startupId}`, data);
};

export const publishPitchReel = async () => {
  return await apiClient.post('/startups/my/publish-reel');
};

export const analyzeStartup = async (startupId, question) => {
  return await apiClient.post(`/startups/${startupId}/analyze`, { question });
};

export default {
  getStartupDetails,
  followStartup,
  unfollowStartup,
  getFollowedStartups,
  createStartup,
  getMyStartup,
  updateStartup,
  publishPitchReel,
  analyzeStartup,
};
