import apiClient from './apiClient';

export const getPricing = async () => {
  return await apiClient.get('/pricing', { requiresAuth: false });
};

export const createOrder = async (planType) => {
  return await apiClient.post('/create-order', { planType });
};

export default {
  getPricing,
  createOrder,
};
