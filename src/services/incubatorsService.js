import apiClient from './apiClient';

export const createIncubator = async (data) => {
    return await apiClient.post('/incubators', data);
};

export const getMyIncubatorProfile = async () => {
    return await apiClient.get('/incubators/my');
};

export const updateIncubatorProfile = async (data) => {
    return await apiClient.patch('/incubators/my', data);
};

export default {
    createIncubator,
    getMyIncubatorProfile,
    updateIncubatorProfile
};
