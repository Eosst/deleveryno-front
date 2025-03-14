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
  CircularProgress,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ApproveIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { getStockItems, createStockItem, updateStockItem, deleteStockItem, approveStockItem } from '../../api/stock';

const AdminStockManagement = () => {
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
    seller_id: ''
  });
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  const fetchStockItems = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getStockItems();
      setStockItems(response.results || []);
    } catch (err) {
      console.error('Error fetching stock items:', err);
      setError('Failed to load inventory items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockItems();
  }, []);

  const handleOpenAddDialog = () => {
    setFormData({
      item_name: '',
      quantity: 0,
      seller_id: ''
    });
    setDialogMode('add');
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (item) => {
    setFormData({
      item_name: item.item_name,
      quantity: item.quantity,
      seller_id: item.seller?.id || ''
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

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4">Inventory Management</Typography>
        <Box>
          <Button
            variant="outlined"
            color="info"
            startIcon={<InfoIcon />}
            onClick={() => setInfoDialogOpen(true)}
            sx={{ mr: 2 }}
          >
            ABOUT APPROVAL
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
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

      <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '4px' }}>
        <Box sx={{ padding: 2 }}>
          <TextField
            fullWidth
            placeholder="Search inventory items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>

        <Box sx={{ display: 'flex', padding: 2, borderTop: '1px solid #e0e0e0', bgcolor: '#f5f5f5', fontWeight: 'bold' }}>
          <Box width="20%">Item Name</Box>
          <Box width="15%">Quantity</Box>
          <Box width="15%">Seller</Box>
          <Box width="15%">Stock Status</Box>
          <Box width="15%">Approval Status</Box>
          <Box width="20%" textAlign="center">Actions</Box>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : filteredItems.length === 0 ? (
          <Box p={4} textAlign="center">
            <Typography variant="body1" color="textSecondary">No inventory items found</Typography>
          </Box>
        ) : (
          filteredItems.map((item) => (
            <Box 
              key={item.id} 
              sx={{ 
                display: 'flex', 
                padding: 2, 
                borderTop: '1px solid #e0e0e0',
                '&:hover': { bgcolor: '#f9f9f9' }
              }}
            >
              <Box width="20%">{item.item_name}</Box>
              <Box width="15%">{item.quantity}</Box>
              <Box width="15%">{item.seller?.username || 'Unknown'}</Box>
              <Box width="15%">
                <Box 
                  sx={{ 
                    display: 'inline-block',
                    bgcolor: '#4caf50',
                    color: 'white',
                    borderRadius: '16px',
                    padding: '4px 12px',
                    fontSize: '0.75rem'
                  }}
                >
                  In Stock
                </Box>
              </Box>
              <Box width="15%">
                <Box 
                  sx={{ 
                    display: 'inline-block',
                    bgcolor: item.approved ? '#4caf50' : '#ff9800',
                    color: 'white',
                    borderRadius: '16px',
                    padding: '4px 12px',
                    fontSize: '0.75rem'
                  }}
                >
                  {item.approved ? 'Approved' : 'Pending Approval'}
                </Box>
              </Box>
              <Box width="20%" display="flex" justifyContent="center" gap={1}>
                {!item.approved && (
                  <Button
                    color="success"
                    variant="contained"
                    size="small"
                    onClick={() => handleApproveItem(item.id)}
                    startIcon={<ApproveIcon />}
                  >
                    Approve
                  </Button>
                )}
                <IconButton color="primary" size="small" onClick={() => handleOpenEditDialog(item)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" size="small" onClick={() => handleDeleteClick(item)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          ))
        )}
      </Box>

      {/* Add/Edit Item Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Inventory Item' : 'Edit Inventory Item'}
        </DialogTitle>
        <DialogContent>
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
          />
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
          {dialogMode === 'add' && (
            <TextField
              margin="dense"
              name="seller_id"
              label="Seller ID"
              type="number"
              fullWidth
              variant="outlined"
              value={formData.seller_id}
              onChange={handleInputChange}
              helperText="Required if creating item as admin"
            />
          )}
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
              <li>Approve pending items by clicking the "Approve" button</li>
              <li>Edit any item details</li>
              <li>Delete items that don't meet your standards</li>
              <li>Add new items directly (which will be automatically approved)</li>
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