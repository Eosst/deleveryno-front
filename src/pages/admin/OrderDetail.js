// src/pages/admin/OrderDetail.js
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
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as CustomerIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Store as SellerIcon,
  DirectionsCar as DriverIcon,
  PersonAdd as AssignIcon
} from '@mui/icons-material';
import { getOrder, updateOrderStatus, deleteOrder, assignDriver } from '../../api/orders';
import { getUsers } from '../../api/users';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Status update dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Assign driver dialog
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [driverLoading, setDriverLoading] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const orderData = await getOrder(id);
      setOrder(orderData);
      if (orderData.status) {
        setNewStatus(orderData.status);
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusDialogOpen = () => {
    setStatusDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    try {
      const updatedOrder = await updateOrderStatus(order.id, newStatus);
      setOrder(updatedOrder);
      setSuccess(`Order status updated to: ${getStatusLabel(updatedOrder.status)}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status. Please try again.');
    } finally {
      setStatusDialogOpen(false);
    }
  };

  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteOrder = async () => {
    try {
      await deleteOrder(order.id);
      setSuccess('Order deleted successfully!');
      setTimeout(() => {
        navigate(-1);
      }, 1000);
    } catch (err) {
      console.error('Error deleting order:', err);
      setError('Failed to delete order. Please try again.');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleAssignDialogOpen = async () => {
    setDriverLoading(true);
    
    try {
      // Fetch available drivers
      const response = await getUsers({ role: 'driver', approved: true });
      setAvailableDrivers(response.results || []);
    } catch (err) {
      console.error('Error fetching drivers:', err);
      setError('Failed to load available drivers. Please try again.');
    } finally {
      setDriverLoading(false);
      setAssignDialogOpen(true);
    }
  };

  const handleAssignDriver = async () => {
    if (!selectedDriverId) return;
    
    try {
      const updatedOrder = await assignDriver(order.id, selectedDriverId);
      setOrder(updatedOrder);
      setSuccess('Driver assigned successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error assigning driver:', err);
      setError('Failed to assign driver. Please try again.');
    } finally {
      setAssignDialogOpen(false);
      setSelectedDriverId('');
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip label="Pending" color="warning" />;
      case 'assigned':
        return <Chip label="Assigned" color="primary" />;
      case 'in_transit':
        return <Chip label="In Transit" color="info" />;
      case 'delivered':
        return <Chip label="Delivered" color="success" />;
      case 'canceled':
        return <Chip label="Canceled" color="error" />;
      case 'no_answer':
        return <Chip label="No Answer" color="default" />;
      case 'postponed':
        return <Chip label="Postponed" color="secondary" />;
      default:
        return <Chip label={status} />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'assigned':
        return 'Assigned';
      case 'in_transit':
        return 'In Transit';
      case 'delivered':
        return 'Delivered';
      case 'canceled':
        return 'Canceled';
      case 'no_answer':
        return 'No Answer';
      case 'postponed':
        return 'Postponed';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Get valid status transitions
  const getValidStatuses = (currentStatus) => {
    switch (currentStatus) {
      case 'pending':
        return ['assigned', 'canceled'];
      case 'assigned':
        return ['in_transit', 'canceled', 'pending'];
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
        return ['pending', 'assigned', 'in_transit', 'delivered', 'no_answer', 'postponed', 'canceled'];
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
        <Box>
          <IconButton 
            color="primary"
            onClick={handleStatusDialogOpen}
            disabled={['delivered', 'canceled'].includes(order.status)}
            sx={{ mr: 1 }}
          >
            <EditIcon />
          </IconButton>
          {order.status === 'pending' && (
            <IconButton 
              color="success" 
              onClick={handleAssignDialogOpen}
              sx={{ mr: 1 }}
            >
              <AssignIcon />
            </IconButton>
          )}
          <IconButton color="error" onClick={handleDeleteDialogOpen}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Typography variant="h4" gutterBottom>
        Order #{order.id}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Order Information</Typography>
              {getStatusChip(order.status)}
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Created</Typography>
                <Typography variant="body1">
                  {new Date(order.created_at).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Last Updated</Typography>
                <Typography variant="body1">
                  {new Date(order.updated_at).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Item</Typography>
                <Typography variant="body1">{order.item}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Quantity</Typography>
                <Typography variant="body1">{order.quantity}</Typography>
              </Grid>
            </Grid>
          </Paper>

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
                  <a href={`tel:${order.customer_phone}`}>{order.customer_phone}</a>
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
                      variant="outlined" 
                      size="small"
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
                  
                  <Typography variant="subtitle2" color="textSecondary">Username</Typography>
                  <Typography variant="body1" gutterBottom>
                    {order.seller.username}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                  <Typography variant="body1" gutterBottom>
                    {order.seller.email}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
                  <Typography variant="body1">
                    {order.seller.phone}
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
              <Box display="flex" alignItems="center" mb={2}>
                <DriverIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Driver</Typography>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              {order.driver ? (
                <>
                  <Typography variant="subtitle2" color="textSecondary">Name</Typography>
                  <Typography variant="body1" gutterBottom>
                    {order.driver.first_name} {order.driver.last_name}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="textSecondary">Username</Typography>
                  <Typography variant="body1" gutterBottom>
                    {order.driver.username}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                  <Typography variant="body1" gutterBottom>
                    {order.driver.email}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
                  <Typography variant="body1">
                    <a href={`tel:${order.driver.phone}`}>{order.driver.phone}</a>
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="body1" color="textSecondary" gutterBottom>
                    No driver assigned
                  </Typography>
                  {order.status === 'pending' && (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AssignIcon />}
                      onClick={handleAssignDialogOpen}
                      fullWidth
                      sx={{ mt: 1 }}
                    >
                      Assign Driver
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Status Update Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Change the status for Order #{order.id}
          </DialogContentText>
          
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="New Status"
            >
              {getValidStatuses(order.status).map(status => (
                <MenuItem key={status} value={status}>
                  {getStatusLabel(status)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUpdateStatus} 
            color="primary"
            disabled={!newStatus || newStatus === order.status}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete order #{order.id}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteOrder} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Driver Dialog */}
      <Dialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Assign Driver to Order #{order.id}</DialogTitle>
        <DialogContent>
          {driverLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : availableDrivers.length === 0 ? (
            <DialogContentText>
              No approved drivers are available. Please approve drivers first.
            </DialogContentText>
          ) : (
            <>
              <DialogContentText sx={{ mb: 2 }}>
                Select a driver to assign to this order:
              </DialogContentText>
              <FormControl fullWidth sx={{ mt: 1 }}>
                <InputLabel>Driver</InputLabel>
                <Select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  label="Driver"
                >
                  {availableDrivers.map(driver => (
                    <MenuItem key={driver.id} value={driver.id}>
                      {driver.first_name} {driver.last_name} ({driver.username})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAssignDriver} 
            color="primary"
            disabled={driverLoading || !selectedDriverId}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderDetail;