// src/routes.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import layouts
import MainLayout from './components/layouts/MainLayout';

// Import auth pages
import LoginPage from './pages/auth/LoginPage';
import SellerRegistration from './pages/auth/SellerRegistration';
import DriverRegistration from './pages/auth/DriverRegistration';

// Import common pages
import NotFound from './components/common/NotFound';
import Profile from './components/common/Profile';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import AdminOrders from './pages/admin/Orders';
import AdminCreateOrder from './pages/admin/CreateOrder';
import AdminOrderDetail from './pages/admin/OrderDetail';
import UserDetail from './pages/admin/UserDetail';
import AdminStockManagement from './pages/admin/StockManagement';

// Seller pages
import SellerDashboard from './pages/seller/Dashboard';
import StockManagement from './pages/seller/StockManagement';
import CreateOrder from './pages/seller/CreateOrder';
import SellerOrders from './pages/seller/Orders';
import SellerOrderDetail from './pages/seller/OrderDetail';

// Driver pages
import DriverDashboard from './pages/driver/Dashboard';
import DriverOrders from './pages/driver/Orders';
import DriverOrderDetail from './pages/driver/OrderDetail';

//message pages
import MessageList from './components/messaging/MessageList';
import MessageDetail from './components/messaging/MessageDetail';
import ComposeMessage from './components/messaging/ComposeMessage';

//password resetting
import PasswordResetRequest from './pages/auth/PasswordResetRequest';
import PasswordResetConfirm from './pages/auth/PasswordResetConfirm';


// Import the ProtectedRoute component
import { ProtectedRoute } from './components/ProtectedRoute';

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
            {/* <Route path="/admin/stock" element={<StockManagement />} /> */}
            {/* <Route path="/profile" element={<Profile />} /> */}
            <Route path="/admin/stock" element={<AdminStockManagement />} />
            {/* <Route path="/messages" element={<MessageList />} />
            <Route path="/messages/new" element={<ComposeMessage />} />
            <Route path="/messages/:id" element={<MessageDetail />} /> */}
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
            {/* <Route path="/profile" element={<Profile />} />
            <Route path="/messages" element={<MessageList />} />
            <Route path="/messages/new" element={<ComposeMessage />} />
            <Route path="/messages/:id" element={<MessageDetail />} /> */}
          </Route>
        </Route>
        
        {/* Driver routes */}
        <Route element={<ProtectedRoute allowedRoles={['driver']} />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/driver/dashboard" replace />} />
            <Route path="/driver/dashboard" element={<DriverDashboard />} />
            <Route path="/driver/orders" element={<DriverOrders />} />
            <Route path="/driver/orders/:id" element={<DriverOrderDetail />} />
            {/* <Route path="/profile" element={<Profile />} />
            <Route path="/messages" element={<MessageList />} />
            <Route path="/messages/new" element={<ComposeMessage />} />
            <Route path="/messages/:id" element={<MessageDetail />} /> */}
          </Route>
        </Route>
        
        
        {/* Catch all - 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;