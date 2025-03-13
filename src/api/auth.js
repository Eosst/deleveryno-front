// src/api/auth.js - EXPANDED VERSION
import api from './axios';

export const login = async (credentials) => {
    // Log what's being sent
    console.log("Login credentials being sent:", credentials);
    
    try {
      const response = await api.post('/login/', credentials);
      return response.data;
    } catch (error) {
      console.error("Login error response:", error.response?.data);
      throw error;
    }
  };

export const registerSeller = async (sellerData) => {
  const response = await api.post('/register/seller/', sellerData);
  return response.data;
};

export const registerDriver = async (driverData) => {
  const response = await api.post('/register/driver/', driverData);
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