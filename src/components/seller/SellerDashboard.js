// src/components/seller/SellerDashboard.js
import React, { useState, useEffect, useContext } from 'react';
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
  ShoppingCart as OrderIcon, 
  LocalShipping as DeliveryIcon,
  Inventory as StockIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../contexts/AuthContext';

// Stat Card Component
const StatCard = ({ title, value, icon, color, subtitle }) => (
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
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// Recent Order Item Component
const RecentOrderItem = ({ order, navigate }) => (
  <Box 
    sx={{ 
      p: 2, 
      mb: 1, 
      borderRadius: 1, 
      bgcolor: 'background.paper',
      border: '1px solid',
      borderColor: 'divider',
      '&:hover': {
        bgcolor: 'action.hover',
        cursor: 'pointer'
      }
    }}
    onClick={() => navigate(`/orders/${order.id}`)}
  >
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="subtitle1">
        Order #{order.id} - {order.customer_name}
      </Typography>
      <Typography 
        variant="body2" 
        sx={{ 
          px: 1, 
          py: 0.5, 
          borderRadius: 1,
          bgcolor: 
            order.status === 'delivered' ? 'success.light' : 
            order.status === 'assigned' || order.status === 'in_transit' ? 'info.light' : 
            order.status === 'pending' ? 'warning.light' : 'error.light',
          color: 
            order.status === 'delivered' ? 'success.contrastText' : 
            order.status === 'assigned' || order.status === 'in_transit' ? 'info.contrastText' : 
            order.status === 'pending' ? 'warning.contrastText' : 'error.contrastText'
        }}
      >
        {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
      </Typography>
    </Box>
    <Typography variant="body2" color="text.secondary">
      Item: {order.item} | Quantity: {order.quantity}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {new Date(order.created_at).toLocaleString()}
    </Typography>
  </Box>
);

// Low Stock Item Component
const LowStockItem = ({ item, navigate }) => (
  <Box 
    sx={{ 
      p: 2, 
      mb: 1, 
      borderRadius: 1, 
      bgcolor: 'background.paper',
      border: '1px solid',
      borderColor: 'divider',
      '&:hover': {
        bgcolor: 'action.hover',
        cursor: 'pointer'
      }
    }}
    onClick={() => navigate(`/seller/stock/${item.id}`)}
  >
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="subtitle1">
        {item.item_name}
      </Typography>
      <Typography 
        variant="body2" 
        sx={{ 
          px: 1, 
          py: 0.5, 
          borderRadius: 1,
          bgcolor: item.quantity === 0 ? 'error.light' : 'warning.light',
          color: item.quantity === 0 ? 'error.contrastText' : 'warning.contrastText'
        }}
      >
        {item.quantity} in stock
      </Typography>
    </Box>
  </Box>
);

const SellerDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: null,
    pendingOrders: null,
    deliveredOrders: null,
    stockItems: null,
    lowStockItems: null
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch orders
      const ordersResponse = await axios.get('/seller/orders/');
      const orders = ordersResponse.data;
      
      // Fetch stock
      const stockResponse = await axios.get('/stock/');
      const stockItems = stockResponse.data;
      
      // Compute stats
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
      const lowStock = stockItems.filter(item => item.quantity < 5);
      
      // Update state
      setStats({
        totalOrders: orders.length,
        pendingOrders,
        deliveredOrders,
        stockItems: stockItems.length,
        lowStockItems: lowStock.length
      });
      
      // Set recent orders (last 5)
      setRecentOrders(orders.slice(0, 5));
      
      // Set low stock items
      setLowStockItems(lowStock);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Seller Dashboard
      </Typography>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      {/* Quick Actions */}
      <Box display="flex" gap={2} mb={3}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/seller/orders/create')}
        >
          Create Order
        </Button>
        <Button 
          variant="outlined" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/seller/stock/create')}
        >
          Add Stock Item
        </Button>
      </Box>
      
      {/* Stats Section */}
      <Grid container spacing={3} mb={4}>
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
            title="Delivered Orders" 
            value={stats.deliveredOrders} 
            icon={<DeliveryIcon fontSize="large" />} 
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Stock Items" 
            value={stats.stockItems} 
            icon={<StockIcon fontSize="large" />} 
            color="#9c27b0"
            subtitle={stats.lowStockItems > 0 ? `${stats.lowStockItems} items low on stock` : null}
          />
        </Grid>
      </Grid>
      
      {/* Recent Orders & Low Stock */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Recent Orders
              </Typography>
              <Button 
                size="small" 
                onClick={() => navigate('/seller/orders')}
              >
                View All
              </Button>
            </Box>
            
            {recentOrders.length > 0 ? (
              recentOrders.map(order => (
                <RecentOrderItem key={order.id} order={order} navigate={navigate} />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" py={2}>
                No orders yet
              </Typography>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Low Stock Items
              </Typography>
              <Button 
                size="small" 
                onClick={() => navigate('/seller/stock')}
              >
                View All Stock
              </Button>
            </Box>
            
            {lowStockItems.length > 0 ? (
              lowStockItems.map(item => (
                <LowStockItem key={item.id} item={item} navigate={navigate} />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" py={2}>
                All items have sufficient stock
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SellerDashboard;