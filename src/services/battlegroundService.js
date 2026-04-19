import apiClient from './apiClient';

export const getOverview = async () => {
  return await apiClient.get('/battleground/overview');
};

export const createOrder = async () => {
  return await apiClient.post('/battleground/create-order');
};

export const verifyPayment = async (payload) => {
  return await apiClient.post('/battleground/verify-payment', payload);
};

export const markPaymentFailed = async (payload) => {
  return await apiClient.post('/battleground/mark-failed', payload);
};

export default {
  getOverview,
  createOrder,
  verifyPayment,
  markPaymentFailed,
};
