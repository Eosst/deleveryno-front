// src/api/messages.js
import api from './axios';

export const getMessages = async (params = {}) => {
  const response = await api.get('/messages/', { params });
  return response.data;
};

export const getMessage = async (id) => {
  const response = await api.get(`/messages/${id}/`);
  return response.data;
};

export const createMessage = async (messageData) => {
  const response = await api.post('/messages/', messageData);
  return response.data;
};

export const updateMessage = async (id, messageData) => {
  const response = await api.patch(`/messages/${id}/`, messageData);
  return response.data;
};

export const deleteMessage = async (id) => {
  const response = await api.delete(`/messages/${id}/`);
  return response.data;
};