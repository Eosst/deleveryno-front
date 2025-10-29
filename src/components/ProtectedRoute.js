// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const ProtectedRoute = ({ 
  allowedRoles, 
  redirectPath = '/login' 
}) => {
  const { user, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          {t('common.loading') || 'Loading...'}
        </Typography>
      </Box>
    );
  }

  // Check if user is authenticated and has allowed role
  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};