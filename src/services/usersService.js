import apiClient from './apiClient';

export const getCurrentUserProfile = async () => {
  return await apiClient.get('/users/me');
};

export const updateUserProfile = async (profileData) => {
  return await apiClient.patch('/users/me', profileData);
};

export const followUser = async (userId) => {
  return await apiClient.post(`/users/${userId}/connect`);
};

export default {
  getCurrentUserProfile,
  updateUserProfile,
  followUser,
};
