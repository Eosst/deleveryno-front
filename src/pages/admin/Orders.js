// src/pages/admin/Orders.js
import React, { useState, useEffect, useCallback } from 'react';
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
import { useTranslation } from 'react-i18next';

const AdminOrders = () => {
  const { t } = useTranslation();
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

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
  
    try {
      const params = {
        page: page + 1,
        page_size: rowsPerPage,
        status: filters.status || undefined,
        delivery_city: filters.delivery_city || undefined,
        customer_name: filters.customer_name || undefined
      };
      
      const response = await getOrders(params);
      setOrders(response.results || []);
      setTotalCount(response.count || 0);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(t('orders.errors.failedLoadOrders'));
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters, t]);

  const debouncedFetchOrders = useDebounce(fetchOrders, 500);

  useEffect(() => {
    debouncedFetchOrders();
  }, [page, rowsPerPage, filters, debouncedFetchOrders]);

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

  const handleDeleteClick = (order) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;
    
    try {
      await deleteOrder(orderToDelete.id);
      setOrders(orders.filter(o => o.id !== orderToDelete.id));
      setSuccess(t('orders.messages.orderDeleted', { id: orderToDelete.id }));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(t('orders.errors.failedDeleteOrder'));
    } finally {
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  const handleAssignClick = async (order) => {
    setOrderToAssign(order);
    setSelectedDriverId('');
    setDriverLoading(true);
    
    try {
      const response = await getUsers({ role: 'driver', approved: true });
      const drivers = (response.results || []).filter(user => user.role === 'driver');
      setAvailableDrivers(drivers);
    } catch (err) {
      console.error('Error fetching drivers:', err);
      setError(t('orders.errors.failedLoadDrivers'));
    } finally {
      setDriverLoading(false);
      setAssignDialogOpen(true);
    }
  };

  const handleAssignDriver = async () => {
    if (!orderToAssign || !selectedDriverId) return;
    
    try {
      const updatedOrder = await assignDriver(orderToAssign.id, selectedDriverId);
      setOrders(orders.map(order => 
        order.id === orderToAssign.id ? updatedOrder : order
      ));
      setSuccess(t('orders.messages.driverAssigned', { id: orderToAssign.id }));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error assigning driver:', err);
      setError(t('orders.errors.failedAssignDriver'));
    } finally {
      setAssignDialogOpen(false);
      setOrderToAssign(null);
      setSelectedDriverId('');
    }
  };

  const handleStatusClick = (order) => {
    setOrderToUpdate(order);
    setNewStatus(order.status);
    setStatusDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!orderToUpdate || !newStatus) return;
    
    try {
      const updatedOrder = await updateOrderStatus(orderToUpdate.id, newStatus);
      setOrders(orders.map(order => 
        order.id === orderToUpdate.id ? updatedOrder : order
      ));
      setSuccess(t('orders.messages.statusUpdated', { 
        id: orderToUpdate.id,
        status: t(`statuses.${updatedOrder.status}`)
      }));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(t('orders.errors.failedUpdateStatus'));
    } finally {
      setStatusDialogOpen(false);
      setOrderToUpdate(null);
      setNewStatus('');
    }
  };

  const getStatusChip = (status) => {
    const statusLabels = {
      pending: <Chip label={t('statuses.pending')} color="warning" size="small" />,
      assigned: <Chip label={t('statuses.assigned')} color="primary" size="small" />,
      in_transit: <Chip label={t('statuses.in_transit')} color="info" size="small" />,
      delivered: <Chip label={t('statuses.delivered')} color="success" size="small" />,
      canceled: <Chip label={t('statuses.canceled')} color="error" size="small" />,
      no_answer: <Chip label={t('statuses.no_answer')} color="default" size="small" />,
      postponed: <Chip label={t('statuses.postponed')} color="secondary" size="small" />
    };
    return statusLabels[status] || <Chip label={status} size="small" />;
  };

  const getValidStatuses = (currentStatus) => {
    switch (currentStatus) {
      case 'pending': return ['assigned', 'canceled'];
      case 'assigned': return ['in_transit', 'canceled', 'pending'];
      case 'in_transit': return ['delivered', 'no_answer', 'postponed', 'canceled'];
      case 'no_answer': return ['in_transit', 'canceled', 'postponed'];
      case 'postponed': return ['in_transit', 'canceled'];
      case 'delivered':
      case 'canceled': return [];
      default: return ['pending', 'assigned', 'in_transit', 'delivered', 'no_answer', 'postponed', 'canceled'];
    }
  };

  const columns = [
    { key: 'id', label: t('orders.columns.orderId') },
    { key: 'customer_name', label: t('orders.columns.customer') },
    { key: 'item', label: t('orders.columns.item'), hidden: isMobile },
    { key: 'quantity', label: t('orders.columns.quantity'), hidden: isMobile },
    { key: 'delivery_city', label: t('orders.columns.deliveryCity'), hidden: isMobile },
    { 
      key: 'seller', 
      label: t('orders.columns.seller'), 
      hidden: isMobile,
      render: (value) => value?.username || t('common.notAvailable')
    },
    { 
      key: 'driver', 
      label: t('orders.columns.driver'),
      render: (value) => value?.username || (
        <Typography variant="body2" color="textSecondary">
          {t('orders.notAssigned')}
        </Typography>
      )
    },
    { 
      key: 'status', 
      label: t('orders.columns.status'),
      render: (value) => getStatusChip(value)
    },
    { 
      key: 'assign_action', 
      label: t('orders.columns.assign'),
      hidden: isMobile,
      render: (value, row) => (
        row.status === 'pending' && (
          <Button
            color="success"
            size="small"
            variant="contained"
            onClick={(e) => {
              e.stopPropagation();
              handleAssignClick(row);
            }}
          >
            {t('orders.assignDriver')}
          </Button>
        )
      )
    },
    { 
      key: 'created_at', 
      label: t('orders.columns.created'), 
      hidden: isMobile,
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  const renderActions = (row) => (
    <Box display="flex" justifyContent={isMobile ? "center" : "flex-end"} flexWrap="wrap" gap={1}>
      <IconButton
        color="primary"
        size="small"
        component={Link}
        to={`/admin/orders/${row.id}`}
        title={t('orders.actions.viewDetails')}
      >
        <ViewIcon />
      </IconButton>
      
      <IconButton
        color="info"
        size="small"
        onClick={() => handleStatusClick(row)}
        title={t('orders.actions.updateStatus')}
      >
        <EditIcon />
      </IconButton>
      
      {row.status === 'pending' && (
        <IconButton
          color="success"
          size="small"
          onClick={() => handleAssignClick(row)}
          title={t('orders.actions.assignDriver')}
        >
          <AssignIcon />
        </IconButton>
      )}
      
      <IconButton
        color="error"
        size="small"
        onClick={() => handleDeleteClick(row)}
        title={t('orders.actions.deleteOrder')}
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
        <Typography variant="h4" sx={{ mb: isMobile ? 2 : 0 }}>
          {t('orders.orderManagement')}
        </Typography>
        <Button
          component={Link}
          to="/admin/orders/create"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          fullWidth={isMobile}
        >
          {t('orders.createNewOrder')}
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

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder={t('orders.searchPlaceholder')}
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
                      {t('orders.searchButton')}
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
              {showFilters ? t('orders.hideFilters') : t('orders.showFilters')}
            </Button>
          </Grid>
          
          {showFilters && (
            <>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>{t('orders.filterStatus')}</InputLabel>
                  <Select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    label={t('orders.filterStatus')}
                  >
                    <MenuItem value="">{t('orders.allStatuses')}</MenuItem>
                    <MenuItem value="pending">{t('statuses.pending')}</MenuItem>
                    <MenuItem value="assigned">{t('statuses.assigned')}</MenuItem>
                    <MenuItem value="in_transit">{t('statuses.in_transit')}</MenuItem>
                    <MenuItem value="delivered">{t('statuses.delivered')}</MenuItem>
                    <MenuItem value="canceled">{t('statuses.canceled')}</MenuItem>
                    <MenuItem value="no_answer">{t('statuses.no_answer')}</MenuItem>
                    <MenuItem value="postponed">{t('statuses.postponed')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={t('orders.filterCity')}
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
                  {t('orders.resetFilters')}
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      <ResponsiveTable
        columns={columns}
        data={orders}
        loading={loading}
        emptyMessage={t('orders.noOrdersFound')}
        onRowClick={(row) => navigate(`/admin/orders/${row.id}`)}
        actions={renderActions}
        primaryKey="id"
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        fullWidth={isMobile}
        maxWidth="sm"
      >
        <DialogTitle>{t('orders.deleteDialog.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('orders.deleteDialog.content', { id: orderToDelete?.id })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleDeleteConfirm} color="error">
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {t('orders.assignDialog.title', { id: orderToAssign?.id })}
        </DialogTitle>
        <DialogContent>
          {driverLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : availableDrivers.length === 0 ? (
            <DialogContentText>
              {t('orders.assignDialog.noDrivers')}
            </DialogContentText>
          ) : (
            <>
              <DialogContentText sx={{ mb: 2 }}>
                {t('orders.assignDialog.selectDriver')}
              </DialogContentText>
              <FormControl fullWidth sx={{ mt: 1 }}>
                <InputLabel>{t('orders.assignDialog.driverLabel')}</InputLabel>
                <Select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  label={t('orders.assignDialog.driverLabel')}
                >
                  {availableDrivers.map(driver => (
                    <MenuItem key={driver.id} value={driver.id}>
                      {t('orders.assignDialog.driverDisplay', {
                        firstName: driver.first_name,
                        lastName: driver.last_name,
                        username: driver.username
                      })}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleAssignDriver} 
            color="primary"
            disabled={driverLoading || !selectedDriverId}
          >
            {t('orders.assignDialog.assignButton')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t('orders.statusDialog.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {t('orders.statusDialog.content', { id: orderToUpdate?.id })}
          </DialogContentText>
          
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>{t('orders.statusDialog.newStatusLabel')}</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label={t('orders.statusDialog.newStatusLabel')}
            >
              {orderToUpdate && getValidStatuses(orderToUpdate.status).map(status => (
                <MenuItem key={status} value={status}>
                  {t(`statuses.${status}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleUpdateStatus} 
            color="primary"
            disabled={!newStatus || newStatus === orderToUpdate?.status}
          >
            {t('common.update')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminOrders;