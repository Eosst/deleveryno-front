import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Auth components
import Login from './components/Auth/Login';
import SellerRegistration from './components/Auth/RegisterSeller';
import DriverRegistration from './components/Auth/RegisterDriver';

// Layout components
import MainLayout from './components/layouts/MainLayout';

// Admin pages
import AdminDashboard from './components/admin/AdminDashboard';
import UserApproval from './components/admin/UserApproval';
import AllOrders from './components/admin/AllOrders';

// Seller pages
import SellerDashboard from './components/seller/SellerDashboard';
import SellerOrders from './components/seller/SellerOrders';
import CreateOrder from './components/seller/CreateOrder';
import SellerStock from './components/seller/SellerStock';

// Driver pages
import DriverDashboard from './components/driver/DriverDashboard';
import DriverOrders from './components/driver/DriverOrders';

// Common/Shared pages
import Profile from './components/common/Profile';
import NotFound from './components/common/NotFound';

// Context
import { AuthProvider } from './contexts/AuthContext';

// Auth guard for protected routes
const PrivateRoute = ({ element, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  
  if (!token || !userString) {
    return <Navigate to="/login" />;
  }
  
  const user = JSON.parse(userString);
  
  // If roles are specified, check if user has permission
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" />;
    } else if (user.role === 'seller') {
      return <Navigate to="/seller/dashboard" />;
    } else if (user.role === 'driver') {
      return <Navigate to="/driver/dashboard" />;
    }
  }
  
  return element;
};

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register/seller" element={<SellerRegistration />} />
            <Route path="/register/driver" element={<DriverRegistration />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={
              <PrivateRoute 
                element={<MainLayout />} 
                allowedRoles={['admin']} 
              />
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserApproval />} />
              <Route path="orders" element={<AllOrders />} />
            </Route>
            
            {/* Seller routes */}
            <Route path="/seller" element={
              <PrivateRoute 
                element={<MainLayout />} 
                allowedRoles={['seller']} 
              />
            }>
              <Route path="dashboard" element={<SellerDashboard />} />
              <Route path="orders" element={<SellerOrders />} />
              <Route path="orders/create" element={<CreateOrder />} />
              <Route path="stock" element={<SellerStock />} />
            </Route>
            
            {/* Driver routes */}
            <Route path="/driver" element={
              <PrivateRoute 
                element={<MainLayout />} 
                allowedRoles={['driver']} 
              />
            }>
              <Route path="dashboard" element={<DriverDashboard />} />
              <Route path="orders" element={<DriverOrders />} />
            </Route>
            
            {/* Common routes */}
            <Route path="/profile" element={
              <PrivateRoute 
                element={<MainLayout><Profile /></MainLayout>} 
                allowedRoles={['admin', 'seller', 'driver']} 
              />
            } />
            
            {/* Default routes */}
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;