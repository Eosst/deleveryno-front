// src/pages/seller/StockManagement.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
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
  InputAdornment,
  Tooltip,
  useMediaQuery,
  useTheme,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  HourglassFull as PendingIcon,
  CheckCircle as ApprovedIcon,
  Info as InfoIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { getStockItems, createStockItem, updateStockItem, deleteStockItem } from '../../api/stock';
import ResponsiveTable from '../../components/common/ResponsiveTable';

const StockManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [stockItems, setStockItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
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
  
  // For filter buttons
  const [approvalFilter, setApprovalFilter] = useState('all'); // 'all', 'approved', 'pending'
  const [stockFilter, setStockFilter] = useState('all'); // 'all', 'low'
  
  // Status counts for filter buttons
  const [statusCounts, setStatusCounts] = useState({
    approved: 0,
    pending: 0,
    lowStock: 0
  });

  const fetchStockItems = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getStockItems();
      const items = response.results || [];
      setStockItems(items);
      
      // Calculate status counts
      const counts = {
        approved: items.filter(item => item.approved).length,
        pending: items.filter(item => !item.approved).length,
        lowStock: items.filter(item => item.quantity < 10).length
      };
      setStatusCounts(counts);
      
      // Apply initial filters
      applyFilters(items, approvalFilter, stockFilter, searchTerm);
    } catch (err) {
      console.error('Error fetching stock items:', err);
      setError('Failed to load inventory items. Please try again.');
      setFilteredItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockItems();
  }, []);
  
  // Apply all filters to the stock items
  const applyFilters = (items, approvalFilter, stockFilter, searchTerm) => {
    let filtered = [...items];
    
    // Apply approval filter
    if (approvalFilter === 'approved') {
      filtered = filtered.filter(item => item.approved);
    } else if (approvalFilter === 'pending') {
      filtered = filtered.filter(item => !item.approved);
    }
    
    // Apply stock level filter
    if (stockFilter === 'low') {
      filtered = filtered.filter(item => item.quantity < 10);
    }
    
    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredItems(filtered);
  };
  
  // Update filtered items when filters change
  useEffect(() => {
    applyFilters(stockItems, approvalFilter, stockFilter, searchTerm);
  }, [approvalFilter, stockFilter, searchTerm, stockItems]);

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
        const updatedItems = [...stockItems, newItem];
        setStockItems(updatedItems);
        
        // Update status counts
        setStatusCounts(prev => ({
          ...prev,
          pending: prev.pending + 1,
          lowStock: newItem.quantity < 10 ? prev.lowStock + 1 : prev.lowStock
        }));
        
        setSuccess('Item added successfully! It is now pending admin approval.');
      } else {
        // Only allow quantity update if item is already approved
        if (currentItem.approved && formData.item_name !== currentItem.item_name) {
          setError('Cannot change the name of an approved item. Please create a new item instead.');
          return;
        }
        
        const updatedItem = await updateStockItem(currentItem.id, formData);
        
        // Update stock items 
        const updatedItems = stockItems.map(item => 
          item.id === currentItem.id ? updatedItem : item
        );
        setStockItems(updatedItems);
        
        // Update low stock count if needed
        const wasLowStock = currentItem.quantity < 10;
        const isLowStock = updatedItem.quantity < 10;
        
        if (wasLowStock !== isLowStock) {
          setStatusCounts(prev => ({
            ...prev,
            lowStock: isLowStock ? prev.lowStock + 1 : prev.lowStock - 1
          }));
        }
        
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
      
      // Update stock items
      const updatedItems = stockItems.filter(item => item.id !== itemToDelete.id);
      setStockItems(updatedItems);
      
      // Update status counts
      setStatusCounts(prev => ({
        approved: itemToDelete.approved ? prev.approved - 1 : prev.approved,
        pending: !itemToDelete.approved ? prev.pending - 1 : prev.pending,
        lowStock: itemToDelete.quantity < 10 ? prev.lowStock - 1 : prev.lowStock
      }));
      
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handlers for filter buttons
  const handleApprovalFilter = (filter) => {
    setApprovalFilter(approvalFilter === filter ? 'all' : filter);
  };
  
  const handleStockFilter = (filter) => {
    setStockFilter(stockFilter === filter ? 'all' : filter);
  };

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

  // Define columns for the responsive table
  const columns = [
    { 
      key: 'item_name', 
      label: 'Item Name',
      render: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {value}
          {!row.approved && (
            <Tooltip title="This item is pending admin approval and cannot be used for orders yet">
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
    { key: 'quantity', label: 'Quantity' },
    { 
      key: 'stock_status', 
      label: 'Stock Status',
      render: (value, row) => getStockStatusChip(row.quantity)
    },
    { 
      key: 'approved', 
      label: 'Approval Status',
      render: (value) => getApprovalChip(value)
    }
  ];

  // Define action buttons for the responsive table
  const renderActions = (row) => (
    <Box display="flex" justifyContent="center" flexWrap="wrap" gap={1}>
      <IconButton
        color="primary"
        onClick={() => handleOpenEditDialog(row)}
        size="small"
        title="Edit Item"
      >
        <EditIcon />
      </IconButton>
      <IconButton
        color="error"
        onClick={() => handleDeleteClick(row)}
        size="small"
        title="Delete Item"
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
            About Approval
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
            fullWidth={isMobile}
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

      {/* NEW: Filter buttons */}
      <Stack 
        direction="row" 
        spacing={1} 
        sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}
        justifyContent={isMobile ? "center" : "flex-start"}
      >
        <Button
          variant={approvalFilter === 'approved' ? 'contained' : 'outlined'}
          color="success"
          onClick={() => handleApprovalFilter('approved')}
          startIcon={<ApprovedIcon />}
          size="small"
        >
          Approved ({statusCounts.approved})
        </Button>
        <Button
          variant={approvalFilter === 'pending' ? 'contained' : 'outlined'}
          color="warning"
          onClick={() => handleApprovalFilter('pending')}
          startIcon={<PendingIcon />}
          size="small"
        >
          Pending ({statusCounts.pending})
        </Button>
        <Button
          variant={stockFilter === 'low' ? 'contained' : 'outlined'}
          color="error"
          onClick={() => handleStockFilter('low')}
          startIcon={<WarningIcon />}
          size="small"
        >
          Low Stock ({statusCounts.lowStock})
        </Button>
        <Button
          variant={approvalFilter === 'all' && stockFilter === 'all' ? 'contained' : 'outlined'}
          color="secondary"
          onClick={() => {
            setApprovalFilter('all');
            setStockFilter('all');
          }}
          size="small"
        >
          All Items
        </Button>
      </Stack>

      {/* Search field */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search inventory items..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Responsive Table */}
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
              When you change the quantity of an item you will need to wait for it to be approved again
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
        fullWidth={isMobile}
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
              When you add new items to your inventory, they will be marked as "Pending Approval" until an administrator reviews and approves them.
            </Typography>
            <Typography paragraph>
              <strong>Important notes:</strong>
            </Typography>
            <Typography component="ul" sx={{ pl: 2 }}>
              <li>Pending items cannot be used for creating orders</li>
              <li>Once an item is approved, you cannot change its name</li>
              <li>If you change the quantity of an item you will need to wait for it to be approved again</li>
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