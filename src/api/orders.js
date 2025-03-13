import api from './axios';

export const getOrders = async (params = {}) => {
  const response = await api.get('/orders/', { params });
  return response.data;
};

export const getOrder = async (id) => {
  const response = await api.get(`/orders/${id}/`);
  return response.data;
};

export const createOrder = async (orderData) => {
  const response = await api.post('/orders/', orderData);
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await api.patch(`/orders/${id}/status/`, { status });
  return response.data;
};

export const assignDriver = async (orderId, driverId) => {
  const response = await api.patch(`/orders/${orderId}/assign/`, { driver_id: driverId });
  return response.data;
};

export const deleteOrder = async (id) => {
  const response = await api.delete(`/orders/${id}/`);
  return response.data;
};

export const getDriverOrders = async () => {
  const response = await api.get('/driver/orders/');
  return response.data;
};

export const getSellerOrders = async () => {
  const response = await api.get('/seller/orders/');
  return response.data;
};