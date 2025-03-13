// src/pages/admin/Orders.js
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
  TablePagination,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  InputAdornment
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  PersonAdd as AssignIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { getOrders, deleteOrder, assignDriver, updateOrderStatus } from '../../api/orders';
import { getUsers } from '../../api/users';

const AdminOrders = () => {
  const navigate = useNavigate();
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

  useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage, filters]);

  const fetchOrders = async () => {
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
  };

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

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Order Management</Typography>
        <Button
          component={Link}
          to="/admin/orders/create"
          variant="contained"
          color="primary"
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
                >
                  Reset Filters
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      {/* Orders Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Item</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Delivery City</TableCell>
              <TableCell>Seller</TableCell>
              <TableCell>Driver</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>{order.item}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>{order.delivery_city}</TableCell>
                  <TableCell>
                    {order.seller?.username || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {order.driver?.username || (
                      <Typography variant="body2" color="textSecondary">
                        Not assigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{getStatusChip(order.status)}</TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" justifyContent="center">
                      <IconButton
                        color="primary"
                        size="small"
                        component={Link}
                        to={`/admin/orders/${order.id}`}
                        title="View Details"
                      >
                        <ViewIcon />
                      </IconButton>
                      
                      <IconButton
                        color="info"
                        size="small"
                        onClick={() => handleStatusClick(order)}
                        title="Update Status"
                      >
                        <EditIcon />
                      </IconButton>
                      
                      {order.status === 'pending' && (
                        <IconButton
                          color="success"
                          size="small"
                          onClick={() => handleAssignClick(order)}
                          title="Assign Driver"
                        >
                          <AssignIcon />
                        </IconButton>
                      )}
                      
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDeleteClick(order)}
                        title="Delete Order"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
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