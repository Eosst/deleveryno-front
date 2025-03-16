import api from './axios';

export const getUsers = async (params = {}) => {
  const response = await api.get('/users/', { params });
  return response.data;
};

export const getUser = async (id) => {
  const response = await api.get(`/users/${id}/`);
  return response.data;
};

export const approveUser = async (id) => {
  const response = await api.patch(`/users/${id}/approve/`);
  return response.data;
};

export const updateUser = async (id, userData) => {
  console.log("Sending update with data:", userData);
  const response = await api.patch(`/users/${id}/`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}/`);
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get('/profile/');
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await api.patch('/profile/', profileData);
  return response.data;
};