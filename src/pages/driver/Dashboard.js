// src/pages/driver/Dashboard.js
import React, { useState, useEffect } from 'react';
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
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Collapse,
  IconButton
} from '@mui/material';
import { Link } from 'react-router-dom';
import { getDriverOrders, updateOrderStatus } from '../../api/orders';
import { 
  LocalShipping as OrderIcon, 
  CheckCircle as DeliveredIcon,
  DirectionsRun as InTransitIcon,
  PendingActions as PendingIcon,
  Person as CustomerIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
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

const OrderCard = ({ order, onStatusUpdate, onRefresh }) => {
  const [expanded, setExpanded] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpdateStatus = async (newStatus) => {
    setLoading(true);
    setError(null);

    try {
      await updateOrderStatus(order.id, newStatus);
      if (onStatusUpdate) {
        onStatusUpdate(order.id, newStatus);
      }
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status. Please try again.');
    } finally {
      setLoading(false);
      setStatusDialogOpen(false);
      setConfirmDialogOpen(false);
    }
  };

  const handleConfirmAction = async () => {
    switch (actionType) {
      case 'accept':
        await handleUpdateStatus('in_transit');
        break;
      case 'delivered':
        await handleUpdateStatus('delivered');
        break;
      case 'no_answer':
        await handleUpdateStatus('no_answer');
        break;
      case 'postponed':
        await handleUpdateStatus('postponed');
        break;
      default:
        break;
    }
  };

  const prepareAction = (type) => {
    setActionType(type);
    setConfirmDialogOpen(true);
  };

  const getStatusChip = (status) => {
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

  const getStatusActionMessage = () => {
    switch (actionType) {
      case 'accept':
        return "Are you sure you want to accept this order and mark it as 'In Transit'?";
      case 'delivered':
        return "Confirm that this order has been delivered successfully?";
      case 'no_answer':
        return "Confirm that the customer didn't answer?";
      case 'postponed':
        return "Confirm that this delivery should be postponed?";
      default:
        return "Are you sure you want to update this order's status?";
    }
  };

  const renderActionButtons = () => {
    if (order.status === 'assigned') {
      return (
        <Button 
          variant="contained" 
          color="success" 
          fullWidth
          onClick={() => prepareAction('accept')}
          disabled={loading}
        >
          Accept Order
        </Button>
      );
    } else if (order.status === 'in_transit') {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button 
            variant="contained" 
            color="success"
            onClick={() => prepareAction('delivered')}
            disabled={loading}
            fullWidth
          >
            Mark Delivered
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              color="warning"
              onClick={() => prepareAction('no_answer')}
              disabled={loading}
              sx={{ flex: 1 }}
            >
              No Answer
            </Button>
            <Button 
              variant="outlined" 
              color="secondary"
              onClick={() => prepareAction('postponed')}
              disabled={loading}
              sx={{ flex: 1 }}
            >
              Postpone
            </Button>
            <Button 
              variant="outlined" 
              color="error"
              onClick={() => prepareAction('canceled')}
              disabled={loading}
              sx={{ flex: 1 }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      );
    }
    return (
      <Button 
        component={Link} 
        to={`/driver/orders/${order.id}`}
        variant="outlined" 
        color="primary"
        fullWidth
      >
        View Details
      </Button>
    );
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Order #{order.id}
          </Typography>
          {getStatusChip(order.status)}
        </Box>
        
        <Box display="flex" alignItems="center" mt={1} mb={1}>
          <CustomerIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body1">
            {order.customer_name}
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center" mb={1}>
          <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body1">
            <a href={`tel:${order.customer_phone}`}>{order.customer_phone}</a>
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="flex-start" mb={1}>
          <LocationIcon sx={{ mr: 1, color: 'primary.main', mt: 0.5 }} />
          <Typography variant="body1">
            {order.delivery_street}, {order.delivery_city}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" color="textSecondary">
            Item: {order.item} (Qty: {order.quantity})
          </Typography>
          <IconButton onClick={() => setExpanded(!expanded)} size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box mt={2}>
            <Divider sx={{ mb: 2 }} />
            {order.delivery_location && (
              <Button 
                variant="outlined" 
                size="small"
                component="a"
                href={`https://maps.google.com?q=${order.delivery_location}`}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<LocationIcon />}
                sx={{ mb: 2 }}
                fullWidth
              >
                Open in Maps
              </Button>
            )}
            <Button 
              component={Link} 
              to={`/driver/orders/${order.id}`}
              variant="text" 
              color="primary"
              size="small"
              fullWidth
            >
              View Full Details
            </Button>
          </Box>
        </Collapse>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        {renderActionButtons()}
      </CardActions>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {getStatusActionMessage()}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmAction} 
            color="primary"
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Card>
  );
};

const DriverDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    inTransit: 0,
    delivered: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = (orderId, newStatus) => {
    // Update orders in state to avoid refetching
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    
    // Update active orders
    const active = updatedOrders.filter(order => 
      !['delivered', 'canceled'].includes(order.status)
    );
    setActiveOrders(active);
    
    // Update stats
    const inTransitOrders = updatedOrders.filter(order => 
      order.status === 'in_transit' || order.status === 'assigned'
    ).length;
    const deliveredOrders = updatedOrders.filter(order => 
      order.status === 'delivered'
    ).length;
    
    setOrderStats({
      total: updatedOrders.length,
      inTransit: inTransitOrders,
      delivered: deliveredOrders
    });

    // Show success message
    setSuccess(`Order status updated successfully to: ${newStatus}`);
    setTimeout(() => setSuccess(null), 3000);
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

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

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
              <OrderCard 
                order={order} 
                onStatusUpdate={handleStatusUpdate}
                onRefresh={fetchData}
              />
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