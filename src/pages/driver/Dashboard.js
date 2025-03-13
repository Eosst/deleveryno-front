// src/pages/driver/Dashboard.js
import React, { useState, useEffect ,useContext } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  CircularProgress,
  Paper,
  Chip,
  Divider,
  Alert
} from '@mui/material';
import { Link } from 'react-router-dom';
import { getDriverOrders } from '../../api/orders';
import { 
  LocalShipping as OrderIcon, 
  CheckCircle as DeliveredIcon,
  DirectionsRun as InTransitIcon,
  PendingActions as PendingIcon,
  Person as CustomerIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const StatCard = ({ title, value, icon, color, loading, linkTo }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Box mr={2} sx={{ color }}>
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h3" component="div" sx={{ textAlign: 'center', mb: 2 }}>
          {loading ? <CircularProgress size={40} /> : value}
        </Typography>
      </CardContent>
      {linkTo && (
        <CardActions>
          <Button 
            component={Link} 
            to={linkTo} 
            size="small" 
            fullWidth
            variant="contained"
            color="primary"
          >
            View Details
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

const DriverDashboard = () => {
  const { user } = useContext(useAuth);
  const [orders, setOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    inTransit: 0,
    delivered: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch driver orders
        const ordersData = await getDriverOrders();
        const ordersList = Array.isArray(ordersData) ? ordersData : [];
        setOrders(ordersList);

        // Get active orders (not delivered or canceled)
        const active = ordersList.filter(order => 
          !['delivered', 'canceled'].includes(order.status)
        );
        setActiveOrders(active);

        // Calculate order statistics
        const inTransitOrders = ordersList.filter(order => 
          order.status === 'in_transit' || order.status === 'assigned'
        ).length;
        const deliveredOrders = ordersList.filter(order => 
          order.status === 'delivered'
        ).length;
        
        setOrderStats({
          total: ordersList.length,
          inTransit: inTransitOrders,
          delivered: deliveredOrders
        });
      } catch (err) {
        console.error('Error fetching driver dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getOrderStatusChip = (status) => {
    switch (status) {
      case 'assigned':
        return <Chip label="Assigned" color="primary" size="small" />;
      case 'in_transit':
        return <Chip label="In Transit" color="info" size="small" />;
      case 'delivered':
        return <Chip label="Delivered" color="success" size="small" />;
      case 'no_answer':
        return <Chip label="No Answer" color="warning" size="small" />;
      case 'postponed':
        return <Chip label="Postponed" color="secondary" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Driver Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Welcome back, {user?.first_name || user?.username}!
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <StatCard 
            title="Total Assignments" 
            value={orderStats.total} 
            icon={<OrderIcon fontSize="large" />} 
            color="primary.main" 
            loading={loading}
            linkTo="/driver/orders"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard 
            title="In Transit" 
            value={orderStats.inTransit} 
            icon={<InTransitIcon fontSize="large" />} 
            color="info.main" 
            loading={loading}
            linkTo="/driver/orders"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard 
            title="Delivered" 
            value={orderStats.delivered} 
            icon={<DeliveredIcon fontSize="large" />} 
            color="success.main" 
            loading={loading}
            linkTo="/driver/orders"
          />
        </Grid>
      </Grid>

      <Typography variant="h5" gutterBottom>
        Active Deliveries
      </Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : activeOrders.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            You don't have any active deliveries at the moment.
          </Typography>
          <Button 
            component={Link} 
            to="/driver/orders" 
            variant="contained" 
            color="primary"
            sx={{ mt: 2 }}
          >
            View All Orders
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {activeOrders.map(order => (
            <Grid item xs={12} md={6} key={order.id}>
              <Paper sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Order #{order.id}
                  </Typography>
                  {getOrderStatusChip(order.status)}
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <Box display="flex" alignItems="center" mb={1}>
                  <CustomerIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body1">
                    {order.customer_name}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" mb={1}>
                  <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body1">
                    {order.customer_phone}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="flex-start" mb={1}>
                  <LocationIcon sx={{ mr: 1, color: 'primary.main', mt: 0.5 }} />
                  <Typography variant="body1">
                    {order.delivery_street}, {order.delivery_city}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  Order Details:
                </Typography>
                <Typography variant="body1">
                  {order.item} (Qty: {order.quantity})
                </Typography>
                
                <Box mt={2} display="flex" justifyContent="flex-end">
                  <Button 
                    component={Link} 
                    to={`/driver/orders/${order.id}`}
                    variant="contained" 
                    color="primary"
                    size="small"
                  >
                    Update Status
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
      
      <Box mt={4} display="flex" justifyContent="center">
        <Button 
          component={Link} 
          to="/driver/orders" 
          variant="outlined" 
          color="primary"
        >
          View All Orders
        </Button>
      </Box>
    </Box>
  );
};

export default DriverDashboard;