// src/components/Admine/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CircularProgress,
  Button
} from '@mui/material';
import { 
  PeopleAlt as UserIcon, 
  ShoppingCart as OrderIcon, 
  LocalShipping as DriverIcon, 
  Store as SellerIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch orders
      const ordersResponse = await axios.get('/orders/');
      const orders = ordersResponse.data || [];
      
      // Count pending orders
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      
      // We don't have a specific endpoint for users in our API check,
      // so we'll use a more general approach:
      let activeSellers = 0;
      let activeDrivers = 0;
      
      try {
        // Try to fetch this info if the endpoint exists
        const usersResponse = await axios.get('/users/');
        const users = usersResponse.data || [];
        
        // Count active users by role
        activeSellers = users.filter(user => user.role === 'seller' && user.approved).length;
        activeDrivers = users.filter(user => user.role === 'driver' && user.approved).length;
      } catch (userErr) {
        console.log('Could not fetch user stats, using defaults');
      }
      
      setStats({
        totalOrders: orders.length,
        pendingOrders,
        activeSellers,
        activeDrivers
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      
      // If we can't get real data, use placeholder data
      setStats({
        totalOrders: 0,
        pendingOrders: 0,
        activeSellers: 0,
        activeDrivers: 0
      });
      
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" gutterBottom>
                Recent Orders
              </Typography>
              <Button 
                size="small" 
                onClick={() => navigate('/admin/orders')}
              >
                View All
              </Button>
            </Box>
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Click "View All" to see all orders
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" gutterBottom>
                User Registration
              </Typography>
              <Button 
                size="small" 
                onClick={() => navigate('/admin/users')}
              >
                View All
              </Button>
            </Box>
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Click "View All" to manage user registrations
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;