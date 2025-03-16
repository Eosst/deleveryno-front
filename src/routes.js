// src/routes.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import lazyLoad from './utils/lazyLoader';

// Import layouts - Keeping MainLayout eager loaded for better user experience
import MainLayout from './components/layouts/MainLayout';

// Import common components directly - these are small and frequently used
import { ProtectedRoute } from './components/ProtectedRoute';

// Import auth pages - these load immediately as they're entry points
import LoginPage from './pages/auth/LoginPage';

// Lazily load all other components to improve initial load time
// Auth pages
const SellerRegistration = lazyLoad(() => import('./pages/auth/SellerRegistration'));
const DriverRegistration = lazyLoad(() => import('./pages/auth/DriverRegistration'));
const PasswordResetRequest = lazyLoad(() => import('./pages/auth/PasswordResetRequest'));
const PasswordResetConfirm = lazyLoad(() => import('./pages/auth/PasswordResetConfirm'));

// Common pages
const NotFound = lazyLoad(() => import('./components/common/NotFound'));
const Profile = lazyLoad(() => import('./components/common/Profile'));

// Admin pages
const AdminDashboard = lazyLoad(() => import('./pages/admin/Dashboard'));
const UserManagement = lazyLoad(() => import('./pages/admin/UserManagement'));
const AdminOrders = lazyLoad(() => import('./pages/admin/Orders'));
const AdminCreateOrder = lazyLoad(() => import('./pages/admin/CreateOrder'));
const AdminOrderDetail = lazyLoad(() => import('./pages/admin/OrderDetail'));
const UserDetail = lazyLoad(() => import('./pages/admin/UserDetail'));
const AdminStockManagement = lazyLoad(() => import('./pages/admin/StockManagement'));

// Seller pages
const SellerDashboard = lazyLoad(() => import('./pages/seller/Dashboard'));
const StockManagement = lazyLoad(() => import('./pages/seller/StockManagement'));
const CreateOrder = lazyLoad(() => import('./pages/seller/CreateOrder'));
const SellerOrders = lazyLoad(() => import('./pages/seller/Orders'));
const SellerOrderDetail = lazyLoad(() => import('./pages/seller/OrderDetail'));

// Driver pages
const DriverDashboard = lazyLoad(() => import('./pages/driver/Dashboard'));
const DriverOrders = lazyLoad(() => import('./pages/driver/Orders'));
const DriverOrderDetail = lazyLoad(() => import('./pages/driver/OrderDetail'));

// Message pages
const MessageList = lazyLoad(() => import('./components/messaging/MessageList'));
const MessageDetail = lazyLoad(() => import('./components/messaging/MessageDetail'));
const ComposeMessage = lazyLoad(() => import('./components/messaging/ComposeMessage'));

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register/seller" element={<SellerRegistration />} />
        <Route path="/register/driver" element={<DriverRegistration />} />
        <Route path="/password-reset" element={<PasswordResetRequest />} />
        <Route path="/password-reset/confirm/:uidb64/:token" element={<PasswordResetConfirm />} />

        <Route element={<ProtectedRoute allowedRoles={['admin', 'seller', 'driver']} />}>
        <Route element={<MainLayout />}>
        <Route path="/messages" element={<MessageList />} />
        <Route path="/messages/new" element={<ComposeMessage />} />
        <Route path="/messages/:id" element={<MessageDetail />} />
        <Route path="/profile" element={<Profile />} />
        </Route>
        </Route>
        
        {/* Redirect root to login if not authenticated */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Admin routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/users/:id" element={<UserDetail />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/orders/create" element={<AdminCreateOrder />} />
            <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
            <Route path="/admin/stock" element={<AdminStockManagement />} />
          </Route>
        </Route>
        
        {/* Seller routes */}
        <Route element={<ProtectedRoute allowedRoles={['seller']} />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/seller/dashboard" replace />} />
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/seller/orders" element={<SellerOrders />} />
            <Route path="/seller/orders/create" element={<CreateOrder />} />
            <Route path="/seller/orders/:id" element={<SellerOrderDetail />} />
            <Route path="/seller/stock" element={<StockManagement />} />
          </Route>
        </Route>
        
        {/* Driver routes */}
        <Route element={<ProtectedRoute allowedRoles={['driver']} />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/driver/dashboard" replace />} />
            <Route path="/driver/dashboard" element={<DriverDashboard />} />
            <Route path="/driver/orders" element={<DriverOrders />} />
            <Route path="/driver/orders/:id" element={<DriverOrderDetail />} />
          </Route>
        </Route>
        
        {/* Catch all - 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;