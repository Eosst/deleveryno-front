// src/pages/driver/Orders.js - Fixed maps links and eye button
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Paper
} from '@mui/material';
import {
  Phone as PhoneIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { getDriverOrders, updateOrderStatus } from '../../api/orders';
import { Link, useNavigate } from 'react-router-dom';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import { usePagination } from '../../hooks/usePerformanceOptimization';

const DriverOrders = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
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

  // Use pagination
  const { 
    page, 
    setPage, 
    itemsPerPage, 
    setItemsPerPage, 
    paginatedItems 
  } = usePagination(filteredOrders, 0, isMobile ? 5 : 10);

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

  // Handle click on the entire card
  const handleCardClick = (order) => {
    navigate(`/driver/orders/${order.id}`);
  };

  const assignedCount = orders.filter(order => order.status === 'assigned').length;
  const inTransitCount = orders.filter(order => order.status === 'in_transit').length;


  // Render mobile view with improved order cards
  const renderMobileView = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      );
    }

    if (filteredOrders.length === 0) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            {statusFilter !== 'all'
              ? `You don't have any orders with status: ${getStatusLabel(statusFilter)}`
              : "You don't have any assigned orders yet."}
          </Typography>
        </Paper>
      );
    }

    return (
      
      <Box>
        {filteredOrders.map((order) => (
          <Card 
            key={order.id}
            sx={{ 
              mb: 2, 
              cursor: 'pointer',
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-2px)',
                transition: 'all 0.2s'
              }
            }}
            onClick={() => handleCardClick(order)}
          >
            <CardContent>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Order ID:</Typography>
                  <Typography variant="body1">#{order.id}</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle2" color="textSecondary">Status:</Typography>
                  {getStatusChip(order.status)}
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Customer:</Typography>
                  <Typography variant="body1">{order.customer_name}</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Location:</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1">{order.delivery_city}</Typography>
                    {order.delivery_location && (
                      <IconButton 
                        size="small" 
                        color="primary" 
                        component="a" 
                        href={order.delivery_location}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ ml: 1 }}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
                        }}
                      >
                        <LocationIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Grid>

                {!['delivered', 'canceled'].includes(order.status) && (
                  <Grid item xs={12} sx={{ mt: 1 }}>
                    <Typography variant="subtitle2" color="textSecondary">Update:</Typography>
                    <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                      <Select
                        value="default"
                        onChange={(e) => {
                          e.stopPropagation(); // Prevent card click when selecting
                          if (e.target.value !== 'default') {
                            handleStatusChange(order, e);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()} // Prevent card click when opening dropdown
                        displayEmpty
                        renderValue={() => "Update Status"}
                        disabled={updateLoading}
                      >
                        <MenuItem value="default" disabled>Update Status</MenuItem>
                        {getAllowedStatuses(order.status).map(status => (
                          <MenuItem key={status} value={status}>
                            {getStatusLabel(status)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  };

  // Define columns for the responsive table
  const columns = [
    { key: 'id', label: 'Order ID', render: (value) => `#${value}` },
    { 
      key: 'customer_name', 
      label: 'Customer',
      render: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {value}
          {!isMobile && (
            <Tooltip title="Call Customer">
              <IconButton 
                size="small" 
                color="primary" 
                component="a" 
                href={`tel:${row.customer_phone}`}
                sx={{ ml: 1 }}
                onClick={(e) => e.stopPropagation()} // Prevent row click when clicking phone
              >
                <PhoneIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )
    },
    { 
      key: 'item_info', 
      label: 'Item',
      hidden: isMobile,
      render: (value, row) => `${row.item} (x${row.quantity})`
    },
    { 
      key: 'location', 
      label: 'Location',
      render: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {row.delivery_city}
          {row.delivery_location && (
            <Tooltip title="Open in Maps">
              <IconButton 
                size="small" 
                color="primary" 
                component="a" 
                href={row.delivery_location}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ ml: 1 }}
                onClick={(e) => e.stopPropagation()} // Prevent row click
              >
                <LocationIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => getStatusChip(value)
    }
  ];

  // Add update status column for desktop
  if (!isMobile) {
    columns.push({
      key: 'update_status',
      label: 'Update',
      render: (value, row) => (
        <FormControl sx={{ minWidth: 150 }}>
          <Select
            value="default"
            onChange={(e) => {
              e.stopPropagation(); // Prevent row click
              if (e.target.value !== 'default') {
                handleStatusChange(row, e);
              }
            }}
            onClick={(e) => e.stopPropagation()} // Prevent row click
            displayEmpty
            renderValue={() => "Update Status"}
            disabled={['delivered', 'canceled'].includes(row.status) || updateLoading}
            size="small"
          >
            <MenuItem value="default" disabled>Update Status</MenuItem>
            {getAllowedStatuses(row.status).map(status => (
              <MenuItem key={status} value={status}>
                {getStatusLabel(status)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )
    });
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
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
      
      <FormControl variant="outlined" sx={{ minWidth: 200, mb: 3, width: isMobile ? '100%' : 'auto' }}>
        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0); // Reset page when filter changes
          }}
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
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button
          variant={statusFilter === 'assigned' ? 'contained' : 'outlined'}
          color="primary"
          onClick={() => setStatusFilter('assigned')}
          size="small"
        >
          Assigned ({assignedCount})
        </Button>
        <Button
          variant={statusFilter === 'in_transit' ? 'contained' : 'outlined'}
          color="info"
          onClick={() => setStatusFilter('in_transit')}
          size="small"
        >
          In Transit ({inTransitCount})
        </Button>
        <Button
          variant={statusFilter === 'all' ? 'contained' : 'outlined'}
          color="secondary"
          onClick={() => setStatusFilter('all')}
          size="small"
        >
          Show All
        </Button>
      </Box>
      
      {isMobile ? (
        renderMobileView()
      ) : (
        <ResponsiveTable
          columns={columns}
          data={paginatedItems}
          loading={loading}
          emptyMessage={
            statusFilter !== 'all'
              ? `You don't have any orders with status: ${getStatusLabel(statusFilter)}`
              : "You don't have any assigned orders yet."
          }
          onRowClick={(row) => navigate(`/driver/orders/${row.id}`)}
          primaryKey="id"
        />
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        fullWidth={isMobile}
        maxWidth="sm"
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