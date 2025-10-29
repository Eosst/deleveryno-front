// src/pages/admin/StockManagement.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ApproveIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { getStockItems, createStockItem, updateStockItem, deleteStockItem, approveStockItem } from '../../api/stock';
import { getUsers } from '../../api/users';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import { useTranslation } from 'react-i18next';

const AdminStockManagement = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isAdmin = true; // Since this is the admin component, we assume user is admin
  
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    item_name: '',
    quantity: 0,
    seller_id: '',
    approved: false
  });
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [availableSellers, setAvailableSellers] = useState([]);

  const fetchStockItems = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getStockItems();
      console.log("Stock items response:", response);
      setStockItems(response.results || []);
    } catch (err) {
      console.error('Error fetching stock items:', err);
      setError(t('stock.management.errors.load_failed'));
    } finally {
      setLoading(false);
    }
  };

  const fetchSellers = async () => {
    try {
      const response = await getUsers({ role: 'seller', approved: true });
      setAvailableSellers(response.results || []);
    } catch (err) {
      console.error('Error fetching sellers:', err);
    }
  };

  useEffect(() => {
    fetchStockItems();
    fetchSellers();
  }, []);

  const handleOpenAddDialog = () => {
    setFormData({
      item_name: '',
      quantity: 0,
      seller_id: '',
      approved: true // Default to approved for admin-created items
    });
    setDialogMode('add');
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (item) => {
    setFormData({
      item_name: item.item_name,
      quantity: item.quantity,
      seller_id: item.seller?.id || '',
      approved: item.approved
    });
    setCurrentItem(item);
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentItem(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'quantity' || name === 'seller_id' ? (parseInt(value, 10) || 0) : value
    });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const handleSubmit = async () => {
    try {
      if (dialogMode === 'add') {
        const newItem = await createStockItem(formData);
        setStockItems([...stockItems, newItem]);
        setSuccess(t('stock.management.success.item_added'));
      } else {
        const updatedItem = await updateStockItem(currentItem.id, formData);
        setStockItems(stockItems.map(item => 
          item.id === currentItem.id ? updatedItem : item
        ));
        setSuccess(t('stock.management.success.item_updated'));
      }
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving stock item:', err);
      setError(t('stock.management.errors.save_failed'));
    }
    
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteStockItem(itemToDelete.id);
      setStockItems(stockItems.filter(item => item.id !== itemToDelete.id));
      setSuccess(t('stock.management.success.item_deleted'));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting stock item:', err);
      setError(t('stock.management.errors.delete_failed'));
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleApproveItem = async (itemId) => {
    try {
      await approveStockItem(itemId);
      // Update the local state to reflect the change
      setStockItems(stockItems.map(item => 
        item.id === itemId ? {...item, approved: true} : item
      ));
      setSuccess(t('stock.management.success.item_approved'));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error approving item:', err);
      setError(t('stock.management.errors.approve_failed'));
    }
  };

  const filteredItems = stockItems.filter(item => 
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const getStatusChip = (status) => {
    return status ? 
      <Chip label={t('stock.management.status.approved')} color="success" size="small" /> : 
      <Chip label={t('stock.management.status.pending')} color="warning" size="small" />;
  };
  
  const getApprovalChip = (approved) => {
    return getStatusChip(approved);
  };

  const getStockStatusChip = (quantity) => {
    if (quantity === 0) {
      return <Chip label={t('stock.management.status.out_of_stock')} color="error" size="small" />;
    } else if (quantity < 5) {
      return <Chip label={t('stock.management.status.low_stock')} color="warning" size="small" />;
    } else {
      return <Chip label={t('stock.management.status.in_stock')} color="success" size="small" />;
    }
  };

  // Define columns for the responsive table
  const columns = [
    { 
      key: 'item_name', 
      label: t('stock.management.table.item_name'),
      render: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {value}
          {!row.approved && (
            <Tooltip title={t('stock.management.tooltips.pending_approval')}>
              <InfoIcon 
                fontSize="small" 
                color="warning" 
                sx={{ ml: 1, verticalAlign: 'middle' }} 
              />
            </Tooltip>
          )}
        </Box>
      )
    },
    { key: 'quantity', label: t('stock.management.table.quantity') },
    { 
      key: 'stock_status', 
      label: t('stock.management.table.stock_status'),
      render: (value, row) => getStockStatusChip(row.quantity)
    },
    { 
      key: 'approved', 
      label: t('stock.management.table.approval_status'),
      render: (value) => getApprovalChip(value)
    },
    // New column for approve action (only visible when user is admin and in desktop view)
    { 
      key: 'approve_action', 
      label: t('stock.management.table.approve'),
      hidden: !isAdmin || isMobile,
      render: (value, row) => (
        !row.approved && (
          <Button
            color="success"
            variant="contained"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleApproveItem(row.id);
            }}
          >
            {t('stock.management.table.approve')}
          </Button>
        )
      )
    }
  ];

  // Define action buttons for the responsive table
  const renderActions = (row) => (
    <Box display="flex" justifyContent="center" flexWrap="wrap" gap={1}>
      {/* Show approve button for admins in mobile view */}
      {isAdmin && !row.approved && isMobile && (
        <Button
          color="success"
          variant="contained"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleApproveItem(row.id);
          }}
          sx={{ mr: 1 }}
        >
          {t('stock.management.table.approve')}
        </Button>
      )}
      <IconButton
        color="primary"
        onClick={() => handleOpenEditDialog(row)}
        size="small"
        title={t('stock.management.actions.edit')}
      >
        <EditIcon />
      </IconButton>
      <IconButton
        color="error"
        onClick={() => handleDeleteClick(row)}
        size="small"
        title={t('stock.management.actions.delete')}
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
        mb={4}
      >
        <Typography variant="h4" sx={{ mb: isMobile ? 2 : 0 }}>{t('stock.management.title')}</Typography>
        <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={2}>
          <Button
            variant="outlined"
            color="info"
            startIcon={<InfoIcon />}
            onClick={() => setInfoDialogOpen(true)}
            fullWidth={isMobile}
          >
            {t('stock.management.about_approval')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
            fullWidth={isMobile}
          >
            {t('stock.management.add_new_item')}
          </Button>
        </Box>
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

      <TextField
        fullWidth
        placeholder={t('stock.management.search_placeholder')}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {/* Responsive Stock Items Table */}
      <ResponsiveTable
        columns={columns}
        data={filteredItems}
        loading={loading}
        emptyMessage={t('stock.management.empty_message')}
        actions={renderActions}
        primaryKey="id"
      />

      {/* Add/Edit Item Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {dialogMode === 'add' ? t('stock.management.dialog.add_title') : t('stock.management.dialog.edit_title')}
        </DialogTitle>
        <DialogContent>
          {dialogMode === 'add' && (
            <DialogContentText sx={{ mb: 2 }}>
              {t('stock.management.dialog.add_text')}
            </DialogContentText>
          )}
          <TextField
            autoFocus
            margin="dense"
            name="item_name"
            label={t('stock.management.form.item_name')}
            fullWidth
            variant="outlined"
            value={formData.item_name}
            onChange={handleInputChange}
            required
            disabled={dialogMode === 'edit' && currentItem?.approved}
          />
          {dialogMode === 'edit' && currentItem?.approved && (
            <DialogContentText sx={{ mt: 1, mb: 1, color: 'warning.main' }}>
              {t('stock.management.dialog.edit_quantity_warning')}
            </DialogContentText>
          )}
          <TextField
            margin="dense"
            name="quantity"
            label={t('stock.management.form.quantity')}
            type="number"
            fullWidth
            variant="outlined"
            value={formData.quantity}
            onChange={handleInputChange}
            required
            InputProps={{
              inputProps: { min: 0 }
            }}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="seller-select-label">{t('stock.management.form.seller')}</InputLabel>
            <Select
              labelId="seller-select-label"
              id="seller-select"
              name="seller_id"
              value={formData.seller_id}
              onChange={handleInputChange}
              label={t('stock.management.form.seller')}
            >
              <MenuItem value="">
                <em>{t('stock.management.form.no_seller')}</em>
              </MenuItem>
              {availableSellers.map((seller) => (
                <MenuItem key={seller.id} value={seller.id}>
                  {seller.first_name && seller.last_name ? (
                    t('stock.management.form.sellerDisplay', {
                      firstName: seller.first_name,
                      lastName: seller.last_name,
                      username: seller.username
                    })
                  ) : (
                    seller.username
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.approved}
                onChange={handleCheckboxChange}
                name="approved"
                color="primary"
              />
            }
            label={t('stock.management.form.approved_label')}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
          <Button onClick={handleSubmit} color="primary">
            {dialogMode === 'add' ? t('common.add') : t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        fullWidth={isMobile}
      >
        <DialogTitle>{t('stock.management.dialog.delete_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('stock.management.dialog.delete_confirm', { itemName: itemToDelete?.item_name })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Info Dialog */}
      <Dialog
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t('stock.management.dialog.info_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Typography paragraph>
              <strong>{t('stock.management.dialog.info_subtitle')}</strong>
            </Typography>
            <Typography paragraph>
              {t('stock.management.dialog.info_p1')}
            </Typography>
            <Typography paragraph>
              <strong>{t('stock.management.dialog.info_p2')}</strong>
            </Typography>
            <Typography component="ul" sx={{ pl: 2 }}>
              <li>{t('stock.management.dialog.info_li1')}</li>
              <li>{t('stock.management.dialog.info_li2')}</li>
              <li>{t('stock.management.dialog.info_li3')}</li>
              <li>{t('stock.management.dialog.info_li4')}</li>
            </Typography>
            <Typography paragraph mt={2}>
              <strong>{t('stock.management.dialog.info_note_title')}</strong> {t('stock.management.dialog.info_note_text')}
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoDialogOpen(false)} color="primary">
            {t('common.understood')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminStockManagement;