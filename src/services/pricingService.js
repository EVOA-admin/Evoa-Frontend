import apiClient from './apiClient';

export const getPricing = async () => {
  return await apiClient.get('/pricing', { requiresAuth: false });
};

export const createOrder = async (planType) => {
  return await apiClient.post('/create-order', { planType });
};

export const verifyPayment = async (payload) => {
  return await apiClient.post('/verify-payment', payload);
};

export default {
  getPricing,
  createOrder,
  verifyPayment,
};
