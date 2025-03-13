// src/routes.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import your page components
import LoginPage from './pages/auth/LoginPage';
import SellerRegistration from './pages/auth/SellerRegistration';
import DriverRegistration from './pages/auth/DriverRegistration';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement.js';

// Seller pages
import SellerDashboard from './pages/seller/Dashboard';
import StockManagement from './pages/seller/StockManagement';
import CreateOrder from './pages/seller/CreateOrder';

// Driver pages
import DriverDashboard from './pages/driver/Dashboard';
import DriverOrders from './pages/driver/Orders';

// Import the ProtectedRoute component we discussed earlier
import { ProtectedRoute } from './components/ProtectedRoute';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register/seller" element={<SellerRegistration />} />
        <Route path="/register/driver" element={<DriverRegistration />} />
        
        {/* Redirect root to login if not authenticated */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Admin routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
        </Route>
        
        {/* Seller routes */}
        <Route element={<ProtectedRoute allowedRoles={['seller']} />}>
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/seller/stock" element={<StockManagement />} />
          <Route path="/seller/orders/new" element={<CreateOrder />} />
        </Route>
        
        {/* Driver routes */}
        <Route element={<ProtectedRoute allowedRoles={['driver']} />}>
          <Route path="/driver/dashboard" element={<DriverDashboard />} />
          <Route path="/driver/orders" element={<DriverOrders />} />
        </Route>
        
        {/* Catch all - 404 */}
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;