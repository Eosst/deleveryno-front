// src/components/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CircularProgress 
} from '@mui/material';
import { 
  PeopleAlt as UserIcon, 
  ShoppingCart as OrderIcon, 
  LocalShipping as DriverIcon, 
  Store as SellerIcon 
} from '@mui/icons-material';
import axios from 'axios';

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center">
        <Box sx={{ mr: 2, color }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="h5" component="div">
            {value !== null ? value : <CircularProgress size={24} />}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: null,
    pendingOrders: null,
    activeSellers: null,
    activeDrivers: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // In a real application, you would fetch these stats from your API
        // For now, we'll simulate it with a timeout
        setTimeout(() => {
          setStats({
            totalOrders: 156,
            pendingOrders: 23,
            activeSellers: 12,
            activeDrivers: 8
          });
          setLoading(false);
        }, 1000);
        
        // Actual API call would look like this:
        // const response = await axios.get('/api/admin/stats/');
        // setStats(response.data);
      } catch (err) {
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Orders" 
            value={stats.totalOrders} 
            icon={<OrderIcon fontSize="large" />} 
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Pending Orders" 
            value={stats.pendingOrders} 
            icon={<OrderIcon fontSize="large" />} 
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Active Sellers" 
            value={stats.activeSellers} 
            icon={<SellerIcon fontSize="large" />} 
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Active Drivers" 
            value={stats.activeDrivers} 
            icon={<DriverIcon fontSize="large" />} 
            color="#9c27b0"
          />
        </Grid>
      </Grid>
      
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Orders
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This section will display recent orders.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              User Registration
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This section will display user registration statistics.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;