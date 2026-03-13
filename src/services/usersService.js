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

export const deleteAccount = async () => {
  return await apiClient.delete('/users/me');
};

export default {
  getCurrentUserProfile,
  updateUserProfile,
  followUser,
  deleteAccount,
};
