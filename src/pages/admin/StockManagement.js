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

const AdminStockManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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
      setError('Failed to load inventory items. Please try again.');
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
        setSuccess('Item added successfully!');
      } else {
        const updatedItem = await updateStockItem(currentItem.id, formData);
        setStockItems(stockItems.map(item => 
          item.id === currentItem.id ? updatedItem : item
        ));
        setSuccess('Item updated successfully!');
      }
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving stock item:', err);
      setError('Failed to save inventory item. Please try again.');
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
      setSuccess('Item deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting stock item:', err);
      setError('Failed to delete inventory item. Please try again.');
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
      setSuccess('Item approved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error approving item:', err);
      setError('Failed to approve item. Please try again.');
    }
  };

  const filteredItems = stockItems.filter(item => 
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusChip = (status) => {
    return status ? 
      <Chip label="Approved" color="success" size="small" /> : 
      <Chip label="Pending Approval" color="warning" size="small" />;
  };

  const getStockStatusChip = (quantity) => {
    if (quantity === 0) {
      return <Chip label="Out of Stock" color="error" size="small" />;
    } else if (quantity < 5) {
      return <Chip label="Low Stock" color="warning" size="small" />;
    } else {
      return <Chip label="In Stock" color="success" size="small" />;
    }
  };

  // Define columns for the responsive table
  const columns = [
    { 
      key: 'item_name', 
      label: 'Item Name',
      render: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {value}
          {!row.approved && (
            <Tooltip title="This item is pending approval">
              <InfoIcon 
                fontSize="small" 
                color="warning" 
                sx={{ ml: 1 }} 
              />
            </Tooltip>
          )}
        </Box>
      )
    },
    { key: 'quantity', label: 'Quantity' },
    { 
      key: 'seller', 
      label: 'Seller',
      hidden: isMobile,
      render: (value) => value ? (
        <Link 
          component={Link} 
          to={`/admin/users/${value.id}`}
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            color: 'primary.main',
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          <PersonIcon sx={{ mr: 0.5, fontSize: 16 }} />
          {value.first_name && value.last_name ? (
            `${value.first_name} ${value.last_name}`
          ) : (
            value.username
          )}
        </Link>
      ) : 'Unknown'
    },
    { 
      key: 'stock_status', 
      label: 'Stock Status',
      render: (value, row) => getStockStatusChip(row.quantity)
    },
    { 
      key: 'approved', 
      label: 'Approval Status',
      render: (value) => getStatusChip(value)
    }
  ];

  // Define action buttons for the responsive table
  const renderActions = (row) => (
    <Box display="flex" justifyContent="center" flexWrap="wrap" gap={1}>
      {!row.approved && (
        <Button
          color="success"
          variant="contained"
          size="small"
          onClick={() => handleApproveItem(row.id)}
          sx={{ mr: 1 }}
        >
          Approve
        </Button>
      )}
      <IconButton
        color="primary"
        onClick={() => handleOpenEditDialog(row)}
        size="small"
        sx={{ mr: 0.5 }}
      >
        <EditIcon />
      </IconButton>
      <IconButton
        color="error"
        onClick={() => handleDeleteClick(row)}
        size="small"
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
        <Typography variant="h4" sx={{ mb: isMobile ? 2 : 0 }}>Inventory Management</Typography>
        <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={2}>
          <Button
            variant="outlined"
            color="info"
            startIcon={<InfoIcon />}
            onClick={() => setInfoDialogOpen(true)}
            fullWidth={isMobile}
          >
            ABOUT APPROVAL
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
            fullWidth={isMobile}
          >
            ADD NEW ITEM
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
        placeholder="Search inventory items..."
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
        emptyMessage="No inventory items found"
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
          {dialogMode === 'add' ? 'Add New Inventory Item' : 'Edit Inventory Item'}
        </DialogTitle>
        <DialogContent>
          {dialogMode === 'add' && (
            <DialogContentText sx={{ mb: 2 }}>
              New items require admin approval before they can be used for creating orders.
            </DialogContentText>
          )}
          <TextField
            autoFocus
            margin="dense"
            name="item_name"
            label="Item Name"
            fullWidth
            variant="outlined"
            value={formData.item_name}
            onChange={handleInputChange}
            required
            disabled={dialogMode === 'edit' && currentItem?.approved}
          />
          {dialogMode === 'edit' && currentItem?.approved && (
            <DialogContentText sx={{ mt: 1, mb: 1, color: 'warning.main' }}>
              when you change the quantity of an item you will need to wait for it to be approved again
            </DialogContentText>
          )}
          <TextField
            margin="dense"
            name="quantity"
            label="Quantity"
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
            <InputLabel id="seller-select-label">Seller</InputLabel>
            <Select
              labelId="seller-select-label"
              id="seller-select"
              name="seller_id"
              value={formData.seller_id}
              onChange={handleInputChange}
              label="Seller"
            >
              <MenuItem value="">
                <em>No specific seller</em>
              </MenuItem>
              {availableSellers.map((seller) => (
                <MenuItem key={seller.id} value={seller.id}>
                  {seller.first_name && seller.last_name ? (
                    `${seller.first_name} ${seller.last_name} (${seller.username})`
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
            label="Item is approved and ready for use"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} color="primary">
            {dialogMode === 'add' ? 'Add' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        fullWidth={isMobile}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{itemToDelete?.item_name}" from inventory? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
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
        <DialogTitle>About Stock Approval</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Typography paragraph>
              <strong>Stock Approval System:</strong>
            </Typography>
            <Typography paragraph>
              When sellers add new items to their inventory, they need approval from an administrator before they can use them for orders.
            </Typography>
            <Typography paragraph>
              <strong>As an administrator, you can:</strong>
            </Typography>
            <Typography component="ul" sx={{ pl: 2 }}>
              <li>Items created by admins are automatically approved</li>
              <li>Approve pending items by clicking the "Approve" button</li>
              <li>Edit any item details including approval status</li>
              <li>Delete items that don't meet your standards</li>
            </Typography>
            <Typography paragraph mt={2}>
              <strong>Note:</strong> Sellers cannot use pending items for orders until they are approved.
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoDialogOpen(false)} color="primary">
            Understood
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminStockManagement;