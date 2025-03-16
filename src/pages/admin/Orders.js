// src/pages/admin/Orders.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as AssignIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { getOrders, deleteOrder, assignDriver, updateOrderStatus } from '../../api/orders';
import { getUsers } from '../../api/users';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import { useDebounce } from '../../hooks/usePerformanceOptimization';

const AdminOrders = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    delivery_city: '',
    customer_name: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  
  // Assign driver dialog
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [orderToAssign, setOrderToAssign] = useState(null);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [driverLoading, setDriverLoading] = useState(false);
  
  // Status update dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  // Use debounced search
  const debouncedFetchOrders = useDebounce(fetchOrders, 500);

  useEffect(() => {
    debouncedFetchOrders();
  }, [page, rowsPerPage, filters]);

  async function fetchOrders() {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: page + 1,
        status: filters.status || undefined,
        delivery_city: filters.delivery_city || undefined,
        customer_name: filters.customer_name || undefined
      };
      
      const response = await getOrders(params);
      setOrders(response.results || []);
      setTotalCount(response.count || 0);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(0);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      customer_name: searchTerm
    }));
    setPage(0);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Delete order handlers
  const handleDeleteClick = (order) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;
    
    try {
      await deleteOrder(orderToDelete.id);
      setOrders(orders.filter(o => o.id !== orderToDelete.id));
      setSuccess(`Order #${orderToDelete.id} has been deleted.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Failed to delete order: ${err.message}`);
    } finally {
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  // Assign driver handlers
  const handleAssignClick = async (order) => {
    setOrderToAssign(order);
    setSelectedDriverId('');
    setDriverLoading(true);
    
    try {
      // Fetch available drivers
      const response = await getUsers({ role: 'driver', approved: true });
      // Filter out non-drivers (as a safeguard)
      const drivers = (response.results || []).filter(user => user.role === 'driver');
      setAvailableDrivers(drivers);
    } catch (err) {
      console.error('Error fetching drivers:', err);
      setError('Failed to load available drivers. Please try again.');
    } finally {
      setDriverLoading(false);
      setAssignDialogOpen(true);
    }
  };

  const handleAssignDriver = async () => {
    if (!orderToAssign || !selectedDriverId) return;
    
    try {
      const updatedOrder = await assignDriver(orderToAssign.id, selectedDriverId);
      
      // Update the order in the local state
      setOrders(orders.map(order => 
        order.id === orderToAssign.id ? updatedOrder : order
      ));
      
      setSuccess(`Driver assigned to order #${orderToAssign.id} successfully.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error assigning driver:', err);
      setError('Failed to assign driver. Please try again.');
    } finally {
      setAssignDialogOpen(false);
      setOrderToAssign(null);
      setSelectedDriverId('');
    }
  };

  // Status update handlers
  const handleStatusClick = (order) => {
    setOrderToUpdate(order);
    setNewStatus(order.status);
    setStatusDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!orderToUpdate || !newStatus) return;
    
    try {
      const updatedOrder = await updateOrderStatus(orderToUpdate.id, newStatus);
      
      // Update the order in the local state
      setOrders(orders.map(order => 
        order.id === orderToUpdate.id ? updatedOrder : order
      ));
      
      setSuccess(`Order #${orderToUpdate.id} status updated to: ${getStatusLabel(updatedOrder.status)}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status. Please try again.');
    } finally {
      setStatusDialogOpen(false);
      setOrderToUpdate(null);
      setNewStatus('');
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" />;
      case 'assigned':
        return <Chip label="Assigned" color="primary" size="small" />;
      case 'in_transit':
        return <Chip label="In Transit" color="info" size="small" />;
      case 'delivered':
        return <Chip label="Delivered" color="success" size="small" />;
      case 'canceled':
        return <Chip label="Canceled" color="error" size="small" />;
      case 'no_answer':
        return <Chip label="No Answer" color="default" size="small" />;
      case 'postponed':
        return <Chip label="Postponed" color="secondary" size="small" />;
      default:
        return <Chip label={status} size="small" />;
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

  // Define columns for the responsive table
  const columns = [
    { key: 'id', label: 'Order ID' },
    { key: 'customer_name', label: 'Customer' },
    { key: 'item', label: 'Item', hidden: isMobile },
    { key: 'quantity', label: 'Qty', hidden: isMobile },
    { key: 'delivery_city', label: 'Delivery City', hidden: isMobile },
    { 
      key: 'seller', 
      label: 'Seller', 
      hidden: isMobile,
      render: (value) => value?.username || 'N/A'
    },
    { 
      key: 'driver', 
      label: 'Driver',
      render: (value) => value?.username || (
        <Typography variant="body2" color="textSecondary">
          Not assigned
        </Typography>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => getStatusChip(value)
    },
    { 
      key: 'created_at', 
      label: 'Created', 
      hidden: isMobile,
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  // Define action buttons for the responsive table
  const renderActions = (row) => (
    <Box display="flex" justifyContent={isMobile ? "center" : "flex-end"} flexWrap="wrap" gap={1}>
      <IconButton
        color="primary"
        size="small"
        component={Link}
        to={`/admin/orders/${row.id}`}
        title="View Details"
      >
        <ViewIcon />
      </IconButton>
      
      <IconButton
        color="info"
        size="small"
        onClick={() => handleStatusClick(row)}
        title="Update Status"
      >
        <EditIcon />
      </IconButton>
      
      {row.status === 'pending' && (
        <IconButton
          color="success"
          size="small"
          onClick={() => handleAssignClick(row)}
          title="Assign Driver"
        >
          <AssignIcon />
        </IconButton>
      )}
      
      <IconButton
        color="error"
        size="small"
        onClick={() => handleDeleteClick(row)}
        title="Delete Order"
      >
        <DeleteIcon />
      </IconButton>
    </Box>
  );

  return (
    <Box>
      <Box 
        display="flex" 
        flexDirection={isMobile ? 'column' : 'row'} 
        justifyContent="space-between" 
        alignItems={isMobile ? "stretch" : "center"} 
        mb={3}
      >
        <Typography variant="h4" sx={{ mb: isMobile ? 2 : 0 }}>Order Management</Typography>
        <Button
          component={Link}
          to="/admin/orders/create"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          fullWidth={isMobile}
        >
          Create New Order
        </Button>
      </Box>

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

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by customer name..."
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Button onClick={handleSearch} variant="text">
                      Search
                    </Button>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} display="flex" justifyContent="flex-end">
            <Button
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              variant="outlined"
              fullWidth={isMobile}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </Grid>
          
          {showFilters && (
            <>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Filter by Status</InputLabel>
                  <Select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    label="Filter by Status"
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="assigned">Assigned</MenuItem>
                    <MenuItem value="in_transit">In Transit</MenuItem>
                    <MenuItem value="delivered">Delivered</MenuItem>
                    <MenuItem value="canceled">Canceled</MenuItem>
                    <MenuItem value="no_answer">No Answer</MenuItem>
                    <MenuItem value="postponed">Postponed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Filter by City"
                  name="delivery_city"
                  value={filters.delivery_city}
                  onChange={handleFilterChange}
                />
              </Grid>
              <Grid item xs={12} md={4} display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  onClick={() => {
                    setFilters({
                      status: '',
                      delivery_city: '',
                      customer_name: ''
                    });
                    setSearchTerm('');
                  }}
                  fullWidth={isMobile}
                >
                  Reset Filters
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      {/* Responsive Orders Table */}
      <ResponsiveTable
        columns={columns}
        data={orders}
        loading={loading}
        emptyMessage="No orders found"
        onRowClick={(row) => navigate(`/admin/orders/${row.id}`)}
        actions={renderActions}
        primaryKey="id"
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        fullWidth={isMobile}
        maxWidth="sm"
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete order #{orderToDelete?.id}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
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
        <DialogTitle>Assign Driver to Order #{orderToAssign?.id}</DialogTitle>
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
            Change the status for Order #{orderToUpdate?.id}
          </DialogContentText>
          
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="New Status"
            >
              {orderToUpdate && getValidStatuses(orderToUpdate.status).map(status => (
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
            disabled={!newStatus || newStatus === orderToUpdate?.status}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminOrders;