// src/pages/admin/UserManagement.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
  IconButton
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { getUsers, approveUser, deleteUser } from '../../api/users';
import { Link, useNavigate } from 'react-router-dom';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import { usePagination } from '../../hooks/usePerformanceOptimization';

const UserManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    role: '',
    approved: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const { 
    page, 
    setPage, 
    itemsPerPage, 
    setItemsPerPage, 
    paginatedItems 
  } = usePagination(users, 0, isMobile ? 5 : 10);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        role: filters.role || undefined,
        approved: filters.approved === 'true' ? true : 
                 filters.approved === 'false' ? false : undefined
      };
      
      const response = await getUsers(params);
      setUsers(response.results || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(0);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    try {
      await deleteUser(userToDelete.id);
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setActionSuccess(`User ${userToDelete.username} has been deleted.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      setError(`Failed to delete user: ${err.message}`);
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      const updatedUser = await approveUser(userId);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, approved: updatedUser.approved } : user
      ));
      setActionSuccess('User has been approved successfully.');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      setError(`Failed to approve user: ${err.message}`);
    }
  };

  // Define columns for the responsive table
  const columns = [
    { key: 'username', label: 'Username' },
    { 
      key: 'name', 
      label: 'Name',
      render: (value, row) => `${row.first_name || ''} ${row.last_name || ''}`.trim() || '-'
    },
    { key: 'email', label: 'Email', hidden: isMobile },
    { 
      key: 'role', 
      label: 'Role',
      render: (value, row) => (
        <Chip 
          label={row.role.charAt(0).toUpperCase() + row.role.slice(1)} 
          color={
            row.role === 'admin' ? 'secondary' : 
            row.role === 'seller' ? 'primary' : 
            'default'
          }
          size="small"
        />
      )
    },
    { key: 'phone', label: 'Phone', hidden: isMobile },
    { key: 'city', label: 'City', hidden: isMobile },
    { 
      key: 'approved', 
      label: 'Status',
      render: (value, row) => (
        row.approved ? (
          <Chip label="Approved" color="success" size="small" />
        ) : (
          <Chip label="Pending" color="warning" size="small" />
        )
      )
    }
  ];

  // Define action buttons for the responsive table
  const renderActions = (row) => (
    <Box display="flex" justifyContent="center" flexWrap="wrap" gap={1}>
      <IconButton 
        color="primary" 
        component={Link}
        to={`/admin/users/${row.id}`}
        title="View User Details"
        size="small"
      >
        <ViewIcon />
      </IconButton>
      {!row.approved && (
        <IconButton 
          color="success" 
          onClick={() => handleApproveUser(row.id)}
          title="Approve User"
          size="small"
        >
          <ApproveIcon />
        </IconButton>
      )}
      <IconButton 
        color="error" 
        onClick={() => handleDeleteClick(row)}
        title="Delete User"
        size="small"
      >
        <DeleteIcon />
      </IconButton>
    </Box>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        User Management
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {actionSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {actionSuccess}
        </Alert>
      )}
      
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button 
          startIcon={<FilterIcon />} 
          onClick={() => setShowFilters(!showFilters)}
          variant="outlined"
          fullWidth={isMobile}
        >
          {showFilters ? 'Hide' : 'Show'} Filters
        </Button>
      </Box>
      
      {showFilters && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={2}>
            <FormControl sx={{ minWidth: 200, flexGrow: 1 }}>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
                label="Role"
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="seller">Seller</MenuItem>
                <MenuItem value="driver">Driver</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl sx={{ minWidth: 200, flexGrow: 1 }}>
              <InputLabel>Approval Status</InputLabel>
              <Select
                name="approved"
                value={filters.approved}
                onChange={handleFilterChange}
                label="Approval Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Approved</MenuItem>
                <MenuItem value="false">Pending Approval</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>
      )}
      
      <ResponsiveTable
        columns={columns}
        data={paginatedItems}
        loading={loading}
        emptyMessage="No users found"
        onRowClick={(row) => navigate(`/admin/users/${row.id}`)}
        actions={renderActions}
        primaryKey="id"
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        fullWidth={isMobile}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete user "{userToDelete?.username}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;