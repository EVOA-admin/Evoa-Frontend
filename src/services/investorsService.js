import apiClient from './apiClient';

export const createInvestor = async (data) => {
    return await apiClient.post('/investors', data);
};

export const getMyInvestorProfile = async () => {
    return await apiClient.get('/investors/my');
};

export default {
    createInvestor,
    getMyInvestorProfile
};
