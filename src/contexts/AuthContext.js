// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize axios with the base URL
  axios.defaults.baseURL = 'http://localhost:8000/';
  
  // Add token to axios requests if available
  axios.interceptors.request.use(
    config => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
      return config;
    },
    error => Promise.reject(error)
  );

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse user data');
        logout();
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      setError(null);
      const response = await axios.post('/login/', { username, password });
      const { token, user } = response.data;
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update context
      setUser(user);
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.error || 'Failed to login');
      throw error;
    }
  };

  const logout = () => {
    // Remove from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Update context
    setUser(null);
  };

  const register = async (userData, role) => {
    try {
      setError(null);
      const endpoint = role === 'seller' ? '/register/seller/' : '/register/driver/';
      const response = await axios.post(endpoint, userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data || 'Failed to register');
      throw error;
    }
  };

  const updateProfile = async (userData) => {
    try {
      setError(null);
      const response = await axios.patch('/profile/', userData);
      
      // Update localStorage and context
      const updatedUser = { ...user, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return updatedUser;
    } catch (error) {
      console.error('Profile update error:', error);
      setError(error.response?.data || 'Failed to update profile');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        register,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;