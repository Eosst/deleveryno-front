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
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next'; // Import translation hook

const OrderDetail = () => {
  const { t } = useTranslation(); // Initialize translation hook
  const { user } = useAuth();
  const isSeller = user?.role === 'seller';
  const isAdmin = user?.role === 'admin';
  const isDriver = user?.role === 'driver';

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
      setError(t('orders.error_loading'));
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
      setSuccess(t('orders.status_updated', { status: getStatusLabel(updatedOrder.status) }));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(t('orders.error_updating_status'));
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
      setSuccess(t('orders.deleted_successfully'));
      setTimeout(() => {
        navigate(-1);
      }, 1000);
    } catch (err) {
      console.error('Error deleting order:', err);
      setError(t('orders.error_deleting'));
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleAssignDialogOpen = async () => {
    setDriverLoading(true);
    
    try {
      // Fetch available drivers
      const response = await getUsers({ role: 'driver', approved: true });
      // Filter out non-drivers (as a safeguard)
      const drivers = (response.results || []).filter(user => user.role === 'driver');
      setAvailableDrivers(drivers);
    } catch (err) {
      console.error('Error fetching drivers:', err);
      setError(t('orders.error_loading_drivers'));
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
      setSuccess(t('orders.driver_assigned_success'));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error assigning driver:', err);
      setError(t('orders.error_assigning_driver'));
    } finally {
      setAssignDialogOpen(false);
      setSelectedDriverId('');
    }
  };

  const getStatusChip = (status) => {
    const getStatusTranslation = (status) => {
      return t(`orders.status.${status}`);
    };
    
    switch (status) {
      case 'pending':
        return <Chip label={getStatusTranslation('pending')} color="warning" />;
      case 'assigned':
        return <Chip label={getStatusTranslation('assigned')} color="primary" />;
      case 'in_transit':
        return <Chip label={getStatusTranslation('in_transit')} color="info" />;
      case 'delivered':
        return <Chip label={getStatusTranslation('delivered')} color="success" />;
      case 'canceled':
        return <Chip label={getStatusTranslation('canceled')} color="error" />;
      case 'no_answer':
        return <Chip label={getStatusTranslation('no_answer')} color="default" />;
      case 'postponed':
        return <Chip label={getStatusTranslation('postponed')} color="secondary" />;
      default:
        return <Chip label={status} />;
    }
  };

  const getStatusLabel = (status) => {
    return t(`orders.status.${status}`);
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
          {t('common.back')}
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box>
        <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          {t('common.back')}
        </Button>
        <Alert severity="warning">{t('orders.not_found')}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button startIcon={<BackIcon />} onClick={() => navigate(-1)}>
          {t('orders.back_to_orders')}
        </Button>
        {/* Only show action buttons for admins and drivers */}
        {!isSeller && (
          <Box>
            <IconButton 
              color="primary"
              onClick={handleStatusDialogOpen}
              disabled={['delivered', 'canceled'].includes(order.status)}
              sx={{ mr: 1 }}
              aria-label={t('orders.update_status')}
            >
              <EditIcon />
            </IconButton>
            {order.status === 'pending' && isAdmin && (
              <IconButton 
                color="success" 
                onClick={handleAssignDialogOpen}
                sx={{ mr: 1 }}
                aria-label={t('orders.assign_driver')}
              >
                <AssignIcon />
              </IconButton>
            )}
            {isAdmin && (
              <IconButton color="error" onClick={handleDeleteDialogOpen} aria-label={t('common.delete')}>
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        )}
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Typography variant="h4" gutterBottom>
        {t('orders.order_number', { id: order.id })}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">{t('orders.order_information')}</Typography>
              {getStatusChip(order.status)}
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">{t('common.created')}</Typography>
                <Typography variant="body1">
                  {new Date(order.created_at).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">{t('common.last_updated')}</Typography>
                <Typography variant="body1">
                  {new Date(order.updated_at).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">{t('orders.item')}</Typography>
                <Typography variant="body1">{order.item}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">{t('orders.quantity')}</Typography>
                <Typography variant="body1">{order.quantity}</Typography>
              </Grid>
              
              {/* Comment/Notes Section */}
              {order.comment && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">{t('orders.comments_notes')}</Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      mt: 1,
                      backgroundColor: '#f9f9f9',
                      borderRadius: 1
                    }}
                  >
                    <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                      {order.comment}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <CustomerIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">{t('customer.information')}</Typography>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">{t('customer.name')}</Typography>
                <Typography variant="body1">{order.customer_name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">{t('customer.phone')}</Typography>
                <Typography variant="body1">
                  <a href={`tel:${order.customer_phone}`}>{order.customer_phone}</a>
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">{t('delivery.address')}</Typography>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">{t('delivery.street')}</Typography>
                <Typography variant="body1">{order.delivery_street}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">{t('delivery.city')}</Typography>
                <Typography variant="body1">{order.delivery_city}</Typography>
              </Grid>
              {order.delivery_location && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">{t('delivery.location')}</Typography>
                  <Box mt={1}>
                    <Button 
                      variant="outlined" 
                      size="small"
                      component="a"
                      href={order.delivery_location}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<LocationIcon />}
                    >
                      {t('delivery.open_in_maps')}
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
                <Typography variant="h6">{t('seller.title')}</Typography>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              {order.seller ? (
                <>
                  <Typography variant="subtitle2" color="textSecondary">{t('common.name')}</Typography>
                  <Typography variant="body1" gutterBottom>
                    {order.seller.first_name} {order.seller.last_name}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="textSecondary">{t('common.username')}</Typography>
                  <Typography variant="body1" gutterBottom>
                    {order.seller.username}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="textSecondary">{t('common.email')}</Typography>
                  <Typography variant="body1" gutterBottom>
                    {order.seller.email}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="textSecondary">{t('common.phone')}</Typography>
                  <Typography variant="body1">
                    {order.seller.phone}
                  </Typography>
                </>
              ) : (
                <Typography variant="body1" color="textSecondary">
                  {t('seller.no_information')}
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Only show driver card for admin and driver roles */}
          {!isSeller && (
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <DriverIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">{t('driver.title')}</Typography>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                {order.driver ? (
                  <>
                    <Typography variant="subtitle2" color="textSecondary">{t('common.name')}</Typography>
                    <Typography variant="body1" gutterBottom>
                      {order.driver.first_name} {order.driver.last_name}
                    </Typography>
                    
                    <Typography variant="subtitle2" color="textSecondary">{t('common.username')}</Typography>
                    <Typography variant="body1" gutterBottom>
                      {order.driver.username}
                    </Typography>
                    
                    <Typography variant="subtitle2" color="textSecondary">{t('common.email')}</Typography>
                    <Typography variant="body1" gutterBottom>
                      {order.driver.email}
                    </Typography>
                    
                    <Typography variant="subtitle2" color="textSecondary">{t('common.phone')}</Typography>
                    <Typography variant="body1">
                      <a href={`tel:${order.driver.phone}`}>{order.driver.phone}</a>
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="body1" color="textSecondary" gutterBottom>
                      {t('driver.no_driver_assigned')}
                    </Typography>
                    {isAdmin && order.status === 'pending' && (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AssignIcon />}
                        onClick={handleAssignDialogOpen}
                        fullWidth
                        sx={{ mt: 1 }}
                      >
                        {t('driver.assign_driver')}
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* For sellers, just show delivery status info instead of the driver card */}
          {isSeller && (
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <DriverIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">{t('delivery.status')}</Typography>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="subtitle2" color="textSecondary">{t('delivery.current_status')}</Typography>
                <Box sx={{ mt: 1, mb: 2 }}>
                  {getStatusChip(order.status)}
                </Box>
                
                <Typography variant="body2" color="textSecondary">
                  {t(`delivery.status_message.${order.status}`)}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Only show dialogs for admin/driver roles */}
      {!isSeller && (
        <>
          {/* Status Update Dialog */}
          <Dialog
            open={statusDialogOpen}
            onClose={() => setStatusDialogOpen(false)}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>{t('orders.update_status_title')}</DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ mb: 2 }}>
                {t('orders.update_status_description', { id: order.id })}
              </DialogContentText>
              
              <FormControl fullWidth sx={{ mt: 1 }}>
                <InputLabel>{t('orders.new_status')}</InputLabel>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  label={t('orders.new_status')}
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
              <Button onClick={() => setStatusDialogOpen(false)}>{t('common.cancel')}</Button>
              <Button 
                onClick={handleUpdateStatus} 
                color="primary"
                disabled={!newStatus || newStatus === order.status}
              >
                {t('common.update')}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
          >
            <DialogTitle>{t('orders.delete_confirmation_title')}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                {t('orders.delete_confirmation_message', { id: order.id })}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)}>{t('common.cancel')}</Button>
              <Button onClick={handleDeleteOrder} color="error">
                {t('common.delete')}
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
            <DialogTitle>{t('orders.assign_driver_title', { id: order.id })}</DialogTitle>
            <DialogContent>
              {driverLoading ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : availableDrivers.length === 0 ? (
                <DialogContentText>
                  {t('orders.no_available_drivers')}
                </DialogContentText>
              ) : (
                <>
                  <DialogContentText sx={{ mb: 2 }}>
                    {t('orders.select_driver')}
                  </DialogContentText>
                  <FormControl fullWidth sx={{ mt: 1 }}>
                    <InputLabel>{t('driver.title')}</InputLabel>
                    <Select
                      value={selectedDriverId}
                      onChange={(e) => setSelectedDriverId(e.target.value)}
                      label={t('driver.title')}
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
              <Button onClick={() => setAssignDialogOpen(false)}>{t('common.cancel')}</Button>
              <Button 
                onClick={handleAssignDriver} 
                color="primary"
                disabled={driverLoading || !selectedDriverId}
              >
                {t('driver.assign')}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default OrderDetail;