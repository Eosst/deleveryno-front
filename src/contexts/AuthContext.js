// src/contexts/AuthContext.js - FIXED VERSION
import React, { createContext, useState, useEffect } from 'react';
import { login as apiLogin, getUserProfile, updateUserProfile } from '../api/auth';

// Create the context with a default value
const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
  updateProfile: () => {},
  loading: true,
  error: null
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiLogin(credentials);
      
      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setUser(data.user);
      return data;
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.error || 
                        err.response?.data?.non_field_errors?.[0] || 
                        'Login failed. Please check your credentials.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedUser = await updateUserProfile(userData);
      
      // Update stored user data
      const newUserData = { ...user, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(newUserData));
      setUser(newUserData);
      
      return updatedUser;
    } catch (err) {
      setError('Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create a value object with all the context data
  const contextValue = {
    user,
    login,
    logout,
    updateProfile,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the context itself
export default AuthContext;

// Export a custom hook to use the auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};