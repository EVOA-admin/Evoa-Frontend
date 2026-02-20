import apiClient from './apiClient';

export const search = async (params) => {
  const { q, type } = params;
  const queryParams = new URLSearchParams({ q });
  if (type) queryParams.append('type', type);
  return await apiClient.get(`/explore/search?${queryParams.toString()}`);
};

export const getTrendingHashtags = async () => {
  return await apiClient.get('/explore/hashtags/trending');
};

export const getTopStartups = async () => {
  return await apiClient.get('/explore/startups/top');
};

export const getStartupsOfWeek = async () => {
  return await apiClient.get('/explore/startups/week');
};

export const getInvestorSpotlight = async () => {
  return await apiClient.get('/explore/investors/spotlight');
};

export const getLiveBattleground = async () => {
  return await apiClient.get('/explore/battleground/live');
};

export default {
  search,
  getTrendingHashtags,
  getTopStartups,
  getStartupsOfWeek,
  getInvestorSpotlight,
  getLiveBattleground,
};
