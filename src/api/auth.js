// src/api/auth.js
import api from './axios';

export const login = async (credentials) => {
  const response = await api.post('/login/', credentials);
  return response.data;
};

export const registerSeller = async (sellerData) => {
  const response = await api.post('/register/seller/', sellerData);
  return response.data;
};

export const registerDriver = async (driverData) => {
  const response = await api.post('/register/driver/', driverData);
  return response.data;
};