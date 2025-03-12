// src/components/Orders/OrderList.js
import React, { useState, useEffect, useContext } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button, 
  Chip, 
  CircularProgress, 
  Alert,
  IconButton,
  Tooltip,
  TablePagination
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalShipping as AssignIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
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

const OrderList = ({ role, driverOnly = false, sellerOnly = false }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      let endpoint = '/orders/';
      
      // Use role-specific endpoints if specified
      if (driverOnly) {
        endpoint = '/driver/orders/';
      } else if (sellerOnly) {
        endpoint = '/seller/orders/';
      }
      
      const response = await axios.get(endpoint);
      setOrders(response.data);
    } catch (err) {
      setError('Failed to load orders. Please try again.');
      console.error('Error fetching orders:', err);
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

  const handleViewDetails = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const handleEditOrder = (orderId) => {
    navigate(`/orders/${orderId}/edit`);
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await axios.delete(`/api/orders/${orderId}/`);
        // Remove the deleted order from the state
        setOrders(orders.filter(order => order.id !== orderId));
      } catch (err) {
        setError('Failed to delete order. Please try again.');
        console.error('Error deleting order:', err);
      }
    }
  };

  const handleAssignDriver = (orderId) => {
    navigate(`/admin/orders/${orderId}/assign`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {driverOnly ? "My Assigned Orders" : sellerOnly ? "My Orders" : "All Orders"}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {sellerOnly && (
        <Box mb={2}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/seller/orders/create')}
          >
            Create New Order
          </Button>
        </Box>
      )}
      
      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Item</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Status</TableCell>
                {user.role === 'admin' && (
                  <>
                    <TableCell>Seller</TableCell>
                    <TableCell>Driver</TableCell>
                  </>
                )}
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length > 0 ? (
                orders
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>#{order.id}</TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell>{order.item}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>
                        <Chip 
                          label={order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')} 
                          color={statusColors[order.status] || 'default'} 
                          size="small" 
                        />
                      </TableCell>
                      {user.role === 'admin' && (
                        <>
                          <TableCell>{order.seller?.username || 'N/A'}</TableCell>
                          <TableCell>{order.driver?.username || 'Unassigned'}</TableCell>
                        </>
                      )}
                      <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Box display="flex">
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              onClick={() => handleViewDetails(order.id)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          {/* Seller can edit only their pending orders */}
                          {user.role === 'seller' && order.status === 'pending' && (
                            <Tooltip title="Edit Order">
                              <IconButton 
                                size="small" 
                                onClick={() => handleEditOrder(order.id)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {/* Only seller can delete their pending orders */}
                          {user.role === 'seller' && order.status === 'pending' && (
                            <Tooltip title="Delete Order">
                              <IconButton 
                                size="small" 
                                color="error" 
                                onClick={() => handleDeleteOrder(order.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {/* Admin can assign drivers to orders */}
                          {user.role === 'admin' && order.status === 'pending' && (
                            <Tooltip title="Assign Driver">
                              <IconButton 
                                size="small" 
                                color="primary" 
                                onClick={() => handleAssignDriver(order.id)}
                              >
                                <AssignIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={user.role === 'admin' ? 9 : 7} align="center">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={orders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default OrderList;