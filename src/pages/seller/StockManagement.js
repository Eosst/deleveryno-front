// src/pages/seller/StockManagement.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  InputAdornment,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  HourglassFull as PendingIcon,
  CheckCircle as ApprovedIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { getStockItems, createStockItem, updateStockItem, deleteStockItem } from '../../api/stock';

const StockManagement = () => {
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    item_name: '',
    quantity: 0
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
      quantity: 0
    });
    setDialogMode('add');
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (item) => {
    setFormData({
      item_name: item.item_name,
      quantity: item.quantity
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
      [name]: name === 'quantity' ? parseInt(value, 10) || 0 : value
    });
  };

  const handleSubmit = async () => {
    try {
      if (dialogMode === 'add') {
        const newItem = await createStockItem(formData);
        setStockItems([...stockItems, newItem]);
        setSuccess('Item added successfully! It is now pending admin approval.');
      } else {
        // Only allow quantity update if item is already approved
        if (currentItem.approved && formData.item_name !== currentItem.item_name) {
          setError('Cannot change the name of an approved item. Please create a new item instead.');
          return;
        }
        
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

  const filteredItems = stockItems.filter(item => 
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getApprovalChip = (approved) => {
    return approved ? 
      <Chip icon={<ApprovedIcon />} label="Approved" color="success" size="small" /> : 
      <Chip icon={<PendingIcon />} label="Pending Approval" color="warning" size="small" />;
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
            About Approval
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            Add New Item
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

      <Paper sx={{ p: 2, mb: 4 }}>
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

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item Name</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Stock Status</TableCell>
                <TableCell>Approval Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No inventory items found
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow 
                    key={item.id}
                    sx={{ 
                      opacity: item.approved ? 1 : 0.7,
                      bgcolor: item.approved ? 'inherit' : 'action.hover'
                    }}
                  >
                    <TableCell>
                      {item.item_name}
                      {!item.approved && (
                        <Tooltip title="This item is pending admin approval and cannot be used for orders yet">
                          <InfoIcon 
                            fontSize="small" 
                            color="warning" 
                            sx={{ ml: 1, verticalAlign: 'middle' }} 
                          />
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      {getStockStatusChip(item.quantity)}
                    </TableCell>
                    <TableCell>
                      {getApprovalChip(item.approved)}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenEditDialog(item)}
                        size="small"
                        title="Edit Item"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(item)}
                        size="small"
                        title="Delete Item"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Item Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
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
            Are you sure you want to delete "{itemToDelete?.item_name}" from your inventory? This action cannot be undone.
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
              When you add new items to your inventory, they will be marked as "Pending Approval" until an administrator reviews and approves them.
            </Typography>
            <Typography paragraph>
              <strong>Important notes:</strong>
            </Typography>
            <Typography component="ul" sx={{ pl: 2 }}>
              <li>Pending items cannot be used for creating orders</li>
              
              <li>Once an item is approved, you cannot change its name</li>
              <li>if you change the quantity of an item you will need to wait for it to be approved again</li>
              <li>If you need a new item, please add it and wait for approval</li>
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

export default StockManagement;