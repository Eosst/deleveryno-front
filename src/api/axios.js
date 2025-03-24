// src/api/axios.js
import axios from 'axios';

const instance = axios.create({
  // baseURL: ' https://bff7-196-75-224-86.ngrok-free.app/api/',
  baseURL: 'http://localhost:8000/api/',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to attach the auth token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle common errors
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 unauthorized (token expired)
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;