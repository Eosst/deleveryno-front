// src/pages/driver/Orders.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon
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
  
  // For confirmation dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
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

  const handleStatusChange = (order, event) => {
    const status = event.target.value;
    if (status !== order.status) {
      setSelectedOrder(order);
      setNewStatus(status);
      setConfirmDialogOpen(true);
    }
  };

  const handleConfirmUpdate = async () => {
    if (!selectedOrder || !newStatus) return;
    
    setUpdateLoading(true);
    
    try {
      await updateOrderStatus(selectedOrder.id, newStatus);
      
      // Update orders in state
      const updatedOrders = orders.map(order => 
        order.id === selectedOrder.id ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      
      // Update filtered orders
      if (statusFilter === 'all') {
        setFilteredOrders(updatedOrders);
      } else {
        setFilteredOrders(updatedOrders.filter(order => order.status === statusFilter));
      }
      
      // Show success message
      setSuccess(`Order #${selectedOrder.id} status updated to: ${getStatusLabel(newStatus)}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status. Please try again.');
    } finally {
      setUpdateLoading(false);
      setConfirmDialogOpen(false);
      setSelectedOrder(null);
      setNewStatus('');
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
      case 'canceled':
        return <Chip label="Canceled" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
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
        <FormControl variant="outlined" sx={{ minWidth: 200 }}>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            displayEmpty
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
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Item</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Update Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {order.customer_name}
                      <Tooltip title="Call Customer">
                        <IconButton 
                          size="small" 
                          color="primary" 
                          component="a" 
                          href={`tel:${order.customer_phone}`}
                          sx={{ ml: 1 }}
                        >
                          <PhoneIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>{order.item} (x{order.quantity})</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {order.delivery_city}
                      {order.delivery_location && (
                        <Tooltip title="Open in Maps">
                          <IconButton 
                            size="small" 
                            color="primary" 
                            component="a" 
                            href={`https://maps.google.com?q=${order.delivery_location}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ ml: 1 }}
                          >
                            <LocationIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{getStatusChip(order.status)}</TableCell>
                  <TableCell>
                    <FormControl fullWidth size="small">
                      <Select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order, e)}
                        disabled={['delivered', 'canceled'].includes(order.status) || updateLoading}
                        displayEmpty
                        renderValue={() => "Update Status"}
                        sx={{ 
                          '& .MuiSelect-select': { 
                            color: ['delivered', 'canceled'].includes(order.status) ? 'text.disabled' : 'primary.main',
                            fontWeight: 500
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
                  </TableCell>
                  <TableCell>
                    <Button
                      component={Link}
                      to={`/driver/orders/${order.id}`}
                      variant="outlined"
                      size="small"
                      startIcon={<ViewIcon />}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to change the status of Order #{selectedOrder?.id} 
            to "{newStatus && getStatusLabel(newStatus)}"?
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

export default DriverOrders;