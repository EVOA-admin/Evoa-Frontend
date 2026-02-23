import apiClient from './apiClient';

export const createInvestor = async (data) => {
    return await apiClient.post('/investors', data);
};

export const getMyInvestorProfile = async () => {
    return await apiClient.get('/investors/my');
};

export const updateInvestorProfile = async (data) => {
    return await apiClient.patch('/investors/my', data);
};

export default {
    createInvestor,
    getMyInvestorProfile,
    updateInvestorProfile
};
