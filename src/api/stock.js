// src/api/stock.js
import api from './axios';

export const getStockItems = async (params = {}) => {
  const response = await api.get('/stock/', { params });
  return response.data;
};

export const getStockItem = async (id) => {
  const response = await api.get(`/stock/${id}/`);
  return response.data;
};

export const createStockItem = async (itemData) => {
  const response = await api.post('/stock/', itemData);
  return response.data;
};

export const updateStockItem = async (id, itemData) => {
  const response = await api.patch(`/stock/${id}/`, itemData);
  return response.data;
};

export const deleteStockItem = async (id) => {
  const response = await api.delete(`/stock/${id}/`);
  return response.data;
};

// Add this new function for approving stock
export const approveStockItem = async (id) => {
  const response = await api.patch(`/stock/${id}/approve/`);
  return response.data;
};