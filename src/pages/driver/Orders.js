// src/pages/driver/Orders.js
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
  Tooltip
} from '@mui/material';
import {
  Visibility as ViewIcon,
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
                href={`https://maps.google.com?q=${row.delivery_location}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ ml: 1 }}
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

  // Update Status column for mobile
  if (isMobile) {
    columns.push({
      key: 'update_status',
      label: 'Update',
      render: (value, row) => (
        <FormControl fullWidth size="small">
          <Select
            value={row.status}
            onChange={(e) => handleStatusChange(row, e)}
            disabled={['delivered', 'canceled'].includes(row.status) || updateLoading}
            displayEmpty
            renderValue={() => "Update"}
            sx={{ 
              '& .MuiSelect-select': { 
                color: ['delivered', 'canceled'].includes(row.status) ? 'text.disabled' : 'primary.main',
                fontWeight: 500,
                padding: '5px 10px',
                minHeight: '30px'
              } 
            }}
          >
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

  // Define action buttons for the responsive table
  const renderActions = (row) => (
    <Box display="flex" justifyContent="center">
      <Button
        component={Link}
        to={`/driver/orders/${row.id}`}
        variant="outlined"
        size="small"
        startIcon={<ViewIcon />}
      >
        {isMobile ? '' : 'Details'}
      </Button>
      
      {/* Show update status dropdown on desktop */}
      {!isMobile && (
        <FormControl sx={{ ml: 1, minWidth: 150 }}>
          <Select
            value={row.status}
            onChange={(e) => handleStatusChange(row, e)}
            disabled={['delivered', 'canceled'].includes(row.status) || updateLoading}
            displayEmpty
            renderValue={() => "Update Status"}
            size="small"
            sx={{ 
              '& .MuiSelect-select': { 
                color: ['delivered', 'canceled'].includes(row.status) ? 'text.disabled' : 'primary.main',
                fontWeight: 500
              } 
            }}
          >
            {getAllowedStatuses(row.status).map(status => (
              <MenuItem key={status} value={status}>
                {getStatusLabel(status)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Box>
  );

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
        actions={renderActions}
        primaryKey="id"
      />

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