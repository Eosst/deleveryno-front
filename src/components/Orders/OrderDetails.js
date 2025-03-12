// src/components/Orders/OrderDetails.js
import React, { useState, useEffect, useContext } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Grid, 
  Chip, 
  Button, 
  CircularProgress, 
  Alert,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LocalShipping as DriverIcon,
  Person as CustomerIcon,
  Inventory as ItemIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../contexts/AuthContext';

// Status chip colors
const statusColors = {
  pending: 'warning',
  assigned: 'info',
  in_transit: 'primary',
  delivered: 'success',
  canceled: 'error',
  no_answer: 'error',
  postponed: 'default'
};

// Status options for update (used by drivers)
const driverStatusOptions = [
  { value: 'in_transit', label: 'In Transit' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'no_answer', label: 'No Answer' },
  { value: 'postponed', label: 'Postponed' }
];

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/orders/${id}/`);
      setOrder(response.data);
      // Initialize status update select with current status
      setStatusUpdate(response.data.status);
    } catch (err) {
      setError('Failed to load order details. Please try again.');
      console.error('Error fetching order details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (e) => {
    setStatusUpdate(e.target.value);
  };

  const updateOrderStatus = async () => {
    setStatusUpdateLoading(true);
    setStatusUpdateSuccess('');
    setError('');
    
    try {
      await axios.patch(`/api/orders/${id}/status/`, {
        status: statusUpdate
      });
      
      // Update the local order state with new status
      setOrder({
        ...order,
        status: statusUpdate
      });
      
      setStatusUpdateSuccess('Order status updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatusUpdateSuccess('');
      }, 3000);
    } catch (err) {
      setError('Failed to update order status. Please try again.');
      console.error('Error updating order status:', err);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box>
        <Alert severity="error">
          Order not found or you don't have permission to view it.
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4">
          Order #{order.id}
        </Typography>
        <Chip 
          label={order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')} 
          color={statusColors[order.status] || 'default'}
          sx={{ ml: 2 }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {statusUpdateSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {statusUpdateSuccess}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Order Details */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Information
              </Typography>
              
              <Box display="flex" alignItems="center" mb={2}>
                <ItemIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body1">
                  <strong>Item:</strong> {order.item}
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="body1" sx={{ ml: 4 }}>
                  <strong>Quantity:</strong> {order.quantity}
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="body1" sx={{ ml: 4 }}>
                  <strong>Created:</strong> {new Date(order.created_at).toLocaleString()}
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center">
                <Typography variant="body1" sx={{ ml: 4 }}>
                  <strong>Last Updated:</strong> {new Date(order.updated_at).toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Customer Details */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Customer Information
              </Typography>
              
              <Box display="flex" alignItems="center" mb={2}>
                <CustomerIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body1">
                  <strong>Name:</strong> {order.customer_name}
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="body1" sx={{ ml: 4 }}>
                  <strong>Phone:</strong> {order.customer_phone}
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="flex-start" mb={2}>
                <LocationIcon sx={{ mr: 1, mt: 0.5, color: 'primary.main' }} />
                <Box>
                  <Typography variant="body1">
                    <strong>Delivery Address:</strong>
                  </Typography>
                  {order.delivery_address ? (
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {order.delivery_address.street}, {order.delivery_address.city}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      No address provided
                    </Typography>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Seller & Driver Details (only for admin and related users) */}
        {(user.role === 'admin' || user.id === order.seller?.id || user.id === order.driver?.id) && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Delivery Information
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>Seller:</strong> {order.seller ? `${order.seller.username} (${order.seller.first_name} ${order.seller.last_name})` : 'N/A'}
                    </Typography>
                    {order.seller && (
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                        Phone: {order.seller.phone || 'N/A'}
                      </Typography>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>Driver:</strong> {order.driver ? `${order.driver.username} (${order.driver.first_name} ${order.driver.last_name})` : 'Not assigned yet'}
                    </Typography>
                    {order.driver && (
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                        Phone: {order.driver.phone || 'N/A'}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Status Update Section (for drivers and admin) */}
        {((user.role === 'driver' && user.id === order.driver?.id) || user.role === 'admin') && 
         order.status !== 'pending' && 
         order.status !== 'canceled' && 
         order.status !== 'delivered' && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Update Order Status
                </Typography>
                <Box display="flex" alignItems="center" mt={2}>
                  <FormControl sx={{ minWidth: 200, mr: 2 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusUpdate}
                      label="Status"
                      onChange={handleStatusChange}
                    >
                      {driverStatusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={updateOrderStatus}
                    disabled={statusUpdateLoading || statusUpdate === order.status}
                  >
                    {statusUpdateLoading ? 'Updating...' : 'Update Status'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default OrderDetails;