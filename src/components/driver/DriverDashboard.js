// src/components/driver/DriverDashboard.js
import React, { useState, useEffect, useContext } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  CircularProgress,
  Button,
  Tabs,
  Tab
} from '@mui/material';
import { 
  LocalShipping as DeliveryIcon,
  CheckCircle as DeliveredIcon,
  PendingActions as PendingIcon,
  Route as RouteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../contexts/AuthContext';

// Stat Card Component
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

// Order Item Component
const OrderItem = ({ order, navigate, showStatus = true }) => (
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
      {showStatus && (
        <Typography 
          variant="body2" 
          sx={{ 
            px: 1, 
            py: 0.5, 
            borderRadius: 1,
            bgcolor: 
              order.status === 'delivered' ? 'success.light' : 
              order.status === 'in_transit' ? 'info.light' : 
              order.status === 'assigned' ? 'warning.light' : 'error.light',
            color: 
              order.status === 'delivered' ? 'success.contrastText' : 
              order.status === 'in_transit' ? 'info.contrastText' : 
              order.status === 'assigned' ? 'warning.contrastText' : 'error.contrastText'
          }}
        >
          {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
        </Typography>
      )}
    </Box>
    <Typography variant="body2">
      Item: {order.item} | Quantity: {order.quantity}
    </Typography>
    <Box display="flex" alignItems="center" mt={1}>
      <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
        Seller: {order.seller?.username || 'Unknown'}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {new Date(order.created_at).toLocaleString()}
      </Typography>
    </Box>
    {order.delivery_address && (
      <Typography variant="body2" color="text.secondary">
        Address: {order.delivery_address.street}, {order.delivery_address.city}
      </Typography>
    )}
  </Box>
);

// Tab Panel Component
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const DriverDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: null,
    activeOrders: null,
    deliveredOrders: null
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch orders assigned to this driver
      const response = await axios.get('/driver/orders/');
      const driverOrders = response.data;
      
      // Compute stats
      const activeOrders = driverOrders.filter(
        order => ['assigned', 'in_transit'].includes(order.status)
      ).length;
      
      const deliveredOrders = driverOrders.filter(
        order => order.status === 'delivered'
      ).length;
      
      // Update state
      setStats({
        totalOrders: driverOrders.length,
        activeOrders,
        deliveredOrders
      });
      
      setOrders(driverOrders);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Filter orders based on tab selection
  const getFilteredOrders = () => {
    switch (tabValue) {
      case 0: // Active orders
        return orders.filter(order => 
          ['assigned', 'in_transit'].includes(order.status)
        );
      case 1: // Delivered orders
        return orders.filter(order => order.status === 'delivered');
      case 2: // Other orders (postponed, no answer)
        return orders.filter(order => 
          ['postponed', 'no_answer'].includes(order.status)
        );
      default:
        return [];
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
        Driver Dashboard
      </Typography>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      {/* Stats Section */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={4}>
          <StatCard 
            title="Active Orders" 
            value={stats.activeOrders} 
            icon={<RouteIcon fontSize="large" />} 
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard 
            title="Delivered Orders" 
            value={stats.deliveredOrders} 
            icon={<DeliveredIcon fontSize="large" />} 
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard 
            title="Total Orders" 
            value={stats.totalOrders} 
            icon={<DeliveryIcon fontSize="large" />} 
            color="#9c27b0"
          />
        </Grid>
      </Grid>
      
      {/* Orders Section */}
      <Paper sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            My Orders
          </Typography>
          <Button 
            size="small" 
            onClick={() => navigate('/driver/orders')}
          >
            View All Orders
          </Button>
        </Box>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="orders tabs">
            <Tab 
              icon={<PendingIcon fontSize="small" />} 
              iconPosition="start" 
              label="Active Orders" 
            />
            <Tab 
              icon={<DeliveredIcon fontSize="small" />} 
              iconPosition="start" 
              label="Delivered" 
            />
            <Tab 
              icon={<RouteIcon fontSize="small" />} 
              iconPosition="start" 
              label="Other" 
            />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          {getFilteredOrders().length > 0 ? (
            getFilteredOrders().map(order => (
              <OrderItem key={order.id} order={order} navigate={navigate} showStatus={true} />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary" align="center" py={2}>
              No active orders found
            </Typography>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {getFilteredOrders().length > 0 ? (
            getFilteredOrders().map(order => (
              <OrderItem key={order.id} order={order} navigate={navigate} showStatus={false} />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary" align="center" py={2}>
              No delivered orders found
            </Typography>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          {getFilteredOrders().length > 0 ? (
            getFilteredOrders().map(order => (
              <OrderItem key={order.id} order={order} navigate={navigate} showStatus={true} />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary" align="center" py={2}>
              No postponed or no-answer orders found
            </Typography>
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default DriverDashboard;