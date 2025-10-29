// src/pages/driver/OrderDetail.js - Fixed maps link and layout
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  IconButton,
  useMediaQuery,
  useTheme,
  ButtonGroup
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
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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
      setError(t('order_detail.load_error'));
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

  const handleDirectStatusUpdate = (status) => {
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
      setSuccess(t('order_detail.status_updated', { status: getStatusLabel(updatedOrder.status) }));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(t('order_detail.status_update_error'));
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
        return <Chip label={t('statuses.assigned')} color="primary" />;
      case 'in_transit':
        return <Chip label={t('statuses.in_transit')} color="info" />;
      case 'delivered':
        return <Chip label={t('statuses.delivered')} color="success" />;
      case 'no_answer':
        return <Chip label={t('statuses.no_answer')} color="warning" />;
      case 'postponed':
        return <Chip label={t('statuses.postponed')} color="secondary" />;
      case 'canceled':
        return <Chip label={t('statuses.canceled')} color="error" />;
      default:
        return <Chip label={t(`statuses.${status}`, status)} />;
    }
  };

  const getStatusLabel = (status) => {
    return t(`statuses.${status}`);
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
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Typography variant="h4" gutterBottom>
        {t('orders.order_number', { id: order.id })}
      </Typography>
      
      {/* Status Update Section - FIXED FOR BOTH MOBILE & DESKTOP */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
        <Grid container spacing={2}>
          {/* Left side - Current Status */}
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center">
              <Typography variant="h6" sx={{ mr: 2 }}>Current Status:</Typography>
              {getStatusChip(order.status)}
            </Box>
          </Grid>
          
          {/* Right side - Update Options */}
          <Grid item xs={12} md={8}>
            {!['delivered', 'canceled'].includes(order.status) && (
              <Box>
                {/* Desktop Version: Dropdown on right side */}
                {!isMobile && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <FormControl sx={{ minWidth: 200 }}>
                      <Select
                        value="default"
                        onChange={(e) => e.target.value !== 'default' && handleDirectStatusUpdate(e.target.value)}
                        displayEmpty
                        renderValue={() => t('orders.update_status')}
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
                  </Box>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
        
        {/* Action Buttons - Consistent layout for mobile and desktop */}
        <Box sx={{ mt: 3 }}>
          {order.status === 'assigned' ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  color="success" 
                  fullWidth
                  onClick={() => handleDirectStatusUpdate('in_transit')}
                  disabled={updateLoading}
                >
                  {t('driver.dashboard.actions.accept')}
                </Button>
              </Grid>
            </Grid>
          ) : order.status === 'in_transit' ? (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Button 
                  variant="contained" 
                  color="success"
                  fullWidth
                  onClick={() => handleDirectStatusUpdate('delivered')}
                  disabled={updateLoading}
                >
                  {t('driver.dashboard.actions.markDelivered')}
                </Button>
              </Grid>
              <Grid item xs={12} md={6}>
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <Button 
                      variant="outlined" 
                      color="warning"
                      fullWidth
                      onClick={() => handleDirectStatusUpdate('no_answer')}
                      disabled={updateLoading}
                    >
                      {t('statuses.no_answer')}
                    </Button>
                  </Grid>
                  <Grid item xs={4}>
                    <Button 
                      variant="outlined" 
                      color="secondary"
                      fullWidth
                      onClick={() => handleDirectStatusUpdate('postponed')}
                      disabled={updateLoading}
                    >
                      {t('driver.dashboard.actions.postpone')}
                    </Button>
                  </Grid>
                  <Grid item xs={4}>
                    <Button 
                      variant="outlined" 
                      color="error"
                      fullWidth
                      onClick={() => handleDirectStatusUpdate('canceled')}
                      disabled={updateLoading}
                    >
                      {t('common.cancel')}
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          ) : null}
        </Box>
      </Paper>

      {/* Order Details Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
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
                <Typography variant="subtitle2" color="textSecondary">{t('common.phone')}</Typography>
                <Typography variant="body1">
                  <Button 
                    startIcon={<PhoneIcon />} 
                    href={`tel:${order.customer_phone}`}
                    color="primary"
                    sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
                    size="small"
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
                      variant="contained" 
                      color="primary"
                      component="a"
                      href={order.delivery_location}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<LocationIcon />}
                      size={isMobile ? "small" : "medium"}
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
                  
                  <Typography variant="subtitle2" color="textSecondary">{t('common.email')}</Typography>
                  <Typography variant="body1" gutterBottom>
                    {order.seller.email}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="textSecondary">{t('common.phone')}</Typography>
                  <Typography variant="body1">
                    <Button 
                      startIcon={<PhoneIcon />} 
                      href={`tel:${order.seller.phone}`}
                      color="primary"
                      sx={{ p: 0, minWidth: 'auto', textTransform: 'none' }}
                      size="small"
                    >
                      {order.seller.phone}
                    </Button>
                  </Typography>
                </>
              ) : (
                <Typography variant="body1" color="textSecondary">
                  {t('seller.no_information')}
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>{t('orders.order_information')}</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="subtitle2" color="textSecondary">{t('orders.columns.item')}</Typography>
              <Typography variant="body1" gutterBottom>
                {order.item}
              </Typography>
              
              <Typography variant="subtitle2" color="textSecondary">{t('orders.columns.quantity')}</Typography>
              <Typography variant="body1" gutterBottom>
                {order.quantity}
              </Typography>
              
              <Typography variant="subtitle2" color="textSecondary">{t('common.created')}</Typography>
              <Typography variant="body1" gutterBottom>
                {new Date(order.created_at).toLocaleString()}
              </Typography>
              
              <Typography variant="subtitle2" color="textSecondary">{t('common.last_updated')}</Typography>
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
        fullWidth={isMobile}
        maxWidth="sm"
      >
        <DialogTitle>{t('driver.orders.confirm.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('driver.orders.confirm.message', {
              id: order.id,
              status: getStatusLabel(newStatus)
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button 
            onClick={handleConfirmUpdate} 
            color="primary"
            disabled={updateLoading}
          >
            {updateLoading ? <CircularProgress size={24} /> : t('common.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderDetail;