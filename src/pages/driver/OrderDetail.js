// src/pages/driver/OrderDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  FormControl,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Person as CustomerIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Store as SellerIcon
} from '@mui/icons-material';
import { getOrder, updateOrderStatus } from '../../api/orders';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const orderData = await getOrder(id);
      setOrder(orderData);
      setNewStatus(orderData.status);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (event) => {
    const status = event.target.value;
    if (status !== order.status) {
      setNewStatus(status);
      setConfirmDialogOpen(true);
    }
  };

  const handleConfirmUpdate = async () => {
    if (!newStatus || newStatus === order.status) return;
    
    setUpdateLoading(true);
    
    try {
      const updatedOrder = await updateOrderStatus(order.id, newStatus);
      setOrder(updatedOrder);
      setSuccess(`Order status updated to: ${getStatusLabel(updatedOrder.status)}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status. Please try again.');
      // Reset status to original
      setNewStatus(order.status);
    } finally {
      setUpdateLoading(false);
      setConfirmDialogOpen(false);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'assigned':
        return <Chip label="Assigned" color="primary" />;
      case 'in_transit':
        return <Chip label="In Transit" color="info" />;
      case 'delivered':
        return <Chip label="Delivered" color="success" />;
      case 'no_answer':
        return <Chip label="No Answer" color="warning" />;
      case 'postponed':
        return <Chip label="Postponed" color="secondary" />;
      case 'canceled':
        return <Chip label="Canceled" color="error" />;
      default:
        return <Chip label={status} />;
    }
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Back
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box>
        <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Back
        </Button>
        <Alert severity="warning">Order not found</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button startIcon={<BackIcon />} onClick={() => navigate(-1)}>
          Back to Orders
        </Button>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Typography variant="h4" gutterBottom>
        Order #{order.id}
      </Typography>
      
      {/* Status Update Card */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h6">Current Status:</Typography>
            {getStatusChip(order.status)}
          </Box>
          
          <Box sx={{ minWidth: 200 }}>
            <FormControl fullWidth>
              <Select
                value={order.status}
                onChange={handleStatusChange}
                displayEmpty
                renderValue={() => "Update Status"}
                disabled={['delivered', 'canceled'].includes(order.status) || updateLoading}
                sx={{ 
                  '& .MuiSelect-select': { 
                    color: ['delivered', 'canceled'].includes(order.status) ? 'text.disabled' : 'primary.main',
                    fontWeight: 'bold'
                  } 
                }}
              >
                {getAllowedStatuses(order.status).map(status => (
                  <MenuItem key={status} value={status}>
                    {getStatusLabel(status)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
        
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          {order.status === 'assigned' && (
            <Button 
              variant="contained" 
              color="success"
              onClick={() => {
                setNewStatus('in_transit');
                setConfirmDialogOpen(true);
              }}
              disabled={updateLoading}
            >
              Accept Order
            </Button>
          )}
          
          {order.status === 'in_transit' && (
            <>
              <Button 
                variant="contained" 
                color="success"
                onClick={() => {
                  setNewStatus('delivered');
                  setConfirmDialogOpen(true);
                }}
                disabled={updateLoading}
              >
                Mark Delivered
              </Button>
              <Button 
                variant="outlined" 
                color="warning"
                onClick={() => {
                  setNewStatus('no_answer');
                  setConfirmDialogOpen(true);
                }}
                disabled={updateLoading}
              >
                No Answer
              </Button>
              <Button 
                variant="outlined" 
                color="secondary"
                onClick={() => {
                  setNewStatus('postponed');
                  setConfirmDialogOpen(true);
                }}
                disabled={updateLoading}
              >
                Postpone
              </Button>
              <Button 
                variant="outlined" 
                color="error"
                onClick={() => {
                  setNewStatus('canceled');
                  setConfirmDialogOpen(true);
                }}
                disabled={updateLoading}
              >
                Cancel
              </Button>
            </>
          )}
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <CustomerIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Customer Information</Typography>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Name</Typography>
                <Typography variant="body1">{order.customer_name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
                <Typography variant="body1">
                  <Button 
                    startIcon={<PhoneIcon />} 
                    href={`tel:${order.customer_phone}`}
                    color="primary"
                    sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
                  >
                    {order.customer_phone}
                  </Button>
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Delivery Address</Typography>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">Street</Typography>
                <Typography variant="body1">{order.delivery_street}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">City</Typography>
                <Typography variant="body1">{order.delivery_city}</Typography>
              </Grid>
              {order.delivery_location && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Location</Typography>
                  <Box mt={1}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      component="a"
                      href={`https://maps.google.com?q=${order.delivery_location}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<LocationIcon />}
                    >
                      Open in Google Maps
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SellerIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Seller</Typography>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              {order.seller ? (
                <>
                  <Typography variant="subtitle2" color="textSecondary">Name</Typography>
                  <Typography variant="body1" gutterBottom>
                    {order.seller.first_name} {order.seller.last_name}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                  <Typography variant="body1" gutterBottom>
                    {order.seller.email}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
                  <Typography variant="body1">
                    <Button 
                      startIcon={<PhoneIcon />} 
                      href={`tel:${order.seller.phone}`}
                      color="primary"
                      sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
                    >
                      {order.seller.phone}
                    </Button>
                  </Typography>
                </>
              ) : (
                <Typography variant="body1" color="textSecondary">
                  No seller information available
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Order Details</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="subtitle2" color="textSecondary">Item</Typography>
              <Typography variant="body1" gutterBottom>
                {order.item}
              </Typography>
              
              <Typography variant="subtitle2" color="textSecondary">Quantity</Typography>
              <Typography variant="body1" gutterBottom>
                {order.quantity}
              </Typography>
              
              <Typography variant="subtitle2" color="textSecondary">Created</Typography>
              <Typography variant="body1" gutterBottom>
                {new Date(order.created_at).toLocaleString()}
              </Typography>
              
              <Typography variant="subtitle2" color="textSecondary">Last Updated</Typography>
              <Typography variant="body1">
                {new Date(order.updated_at).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to change the status of Order #{order.id} 
            from "{getStatusLabel(order.status)}" to "{getStatusLabel(newStatus)}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmUpdate} 
            color="primary"
            disabled={updateLoading}
          >
            {updateLoading ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderDetail;