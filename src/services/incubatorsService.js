import apiClient from './apiClient';

export const createIncubator = async (data) => {
    return await apiClient.post('/incubators', data);
};

export const getMyIncubatorProfile = async () => {
    return await apiClient.get('/incubators/my');
};

export default {
    createIncubator,
    getMyIncubatorProfile
};
