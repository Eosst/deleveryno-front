// src/pages/driver/Orders.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Person as CustomerIcon
} from '@mui/icons-material';
import { getDriverOrders, updateOrderStatus } from '../../api/orders';
import { Link } from 'react-router-dom';

const DriverOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  
  // For status update dialog
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === statusFilter));
    }
  }, [statusFilter, orders]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getDriverOrders();
      const ordersList = Array.isArray(response) ? response : [];
      setOrders(ordersList);
      setFilteredOrders(ordersList);
    } catch (err) {
      console.error('Error fetching driver orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUpdateDialog = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setUpdateDialogOpen(true);
  };

  const handleCloseUpdateDialog = () => {
    setUpdateDialogOpen(false);
    setSelectedOrder(null);
    setNewStatus('');
  };

  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    
    setUpdateLoading(true);
    setError(null);
    
    try {
      const updatedOrder = await updateOrderStatus(selectedOrder.id, newStatus);
      
      // Update the order in the local state
      setOrders(orders.map(order => 
        order.id === selectedOrder.id ? { ...order, status: updatedOrder.status } : order
      ));
      
      setSuccess(`Order status updated to: ${getStatusLabel(updatedOrder.status)}`);
      setTimeout(() => setSuccess(null), 3000);
      
      handleCloseUpdateDialog();
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
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

  const getStatusLabel = (status) => {
    switch (status) {
      case 'assigned':
        return 'Assigned';
      case 'in_transit':
        return 'In Transit';
      case 'delivered':
        return 'Delivered';
      case 'no_answer':
        return 'No Answer';
      case 'postponed':
        return 'Postponed';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Get allowed next statuses based on current status
  const getAllowedStatuses = (currentStatus) => {
    switch (currentStatus) {
      case 'assigned':
        return ['in_transit', 'canceled', 'postponed'];
      case 'in_transit':
        return ['delivered', 'no_answer', 'postponed', 'canceled'];
      case 'no_answer':
        return ['in_transit', 'canceled', 'postponed'];
      case 'postponed':
        return ['in_transit', 'canceled'];
      case 'delivered':
      case 'canceled':
        return []; // Terminal states
      default:
        return ['assigned', 'in_transit', 'delivered', 'no_answer', 'postponed', 'canceled'];
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Delivery Orders
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl fullWidth variant="outlined">
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Filter by Status"
          >
            <MenuItem value="all">All Orders</MenuItem>
            <MenuItem value="assigned">Assigned</MenuItem>
            <MenuItem value="in_transit">In Transit</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="no_answer">No Answer</MenuItem>
            <MenuItem value="postponed">Postponed</MenuItem>
            <MenuItem value="canceled">Canceled</MenuItem>
          </Select>
        </FormControl>
      </Paper>
      
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : filteredOrders.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No orders found
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {statusFilter !== 'all'
              ? `You don't have any orders with status: ${getStatusLabel(statusFilter)}`
              : "You don't have any assigned orders yet."}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredOrders.map(order => (
            <Grid item xs={12} md={6} key={order.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                      Order #{order.id}
                    </Typography>
                    {getStatusChip(order.status)}
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
                      <a href={`tel:${order.customer_phone}`}>{order.customer_phone}</a>
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="flex-start" mb={1}>
                    <LocationIcon sx={{ mr: 1, color: 'primary.main', mt: 0.5 }} />
                    <Typography variant="body1">
                      {order.delivery_street}, {order.delivery_city}
                    </Typography>
                  </Box>
                  
                  {order.delivery_location && (
                    <Box display="flex" justifyContent="flex-end" mt={1}>
                      <Button 
                        variant="outlined" 
                        size="small"
                        component="a"
                        href={`https://maps.google.com?q=${order.delivery_location}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open in Maps
                      </Button>
                    </Box>
                  )}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        Order Details:
                      </Typography>
                      <Typography variant="body1">
                        {order.item} (Qty: {order.quantity})
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Seller:</Typography>
                      <Typography variant="body2">
                        {order.seller?.username || 'Unknown'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Created:</Typography>
                      <Typography variant="body2">
                        {new Date(order.created_at).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    color="primary"
                    fullWidth
                    variant="contained"
                    onClick={() => handleOpenUpdateDialog(order)}
                    disabled={['delivered', 'canceled'].includes(order.status)}
                  >
                    Update Status
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Status Update Dialog */}
      <Dialog
        open={updateDialogOpen}
        onClose={handleCloseUpdateDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Change the status for Order #{selectedOrder?.id} ({selectedOrder?.item})
          </DialogContentText>
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={newStatus}
              onChange={handleStatusChange}
              label="New Status"
            >
              {selectedOrder && getAllowedStatuses(selectedOrder.status).map(status => (
                <MenuItem key={status} value={status}>
                  {getStatusLabel(status)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUpdateDialog}>Cancel</Button>
          <Button 
            onClick={handleUpdateStatus} 
            color="primary"
            disabled={updateLoading || !newStatus || newStatus === selectedOrder?.status}
          >
            {updateLoading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DriverOrders;