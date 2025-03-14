// src/pages/admin/UserManagement.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { getUsers, approveUser, deleteUser } from '../../api/users';
import { Link } from 'react-router-dom';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    role: '',
    approved: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: page + 1,
        role: filters.role || undefined,
        approved: filters.approved === 'true' ? true : 
                 filters.approved === 'false' ? false : undefined
      };
      
      const response = await getUsers(params);
      setUsers(response.results || []);
      setTotalCount(response.count || 0);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, filters]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
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
        >
          Filters
        </Button>
      </Box>
      
      {showFilters && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box display="flex" flexWrap="wrap" gap={2}>
            <FormControl sx={{ minWidth: 200 }}>
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
            
            <FormControl sx={{ minWidth: 200 }}>
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
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{`${user.first_name} ${user.last_name}`}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role.charAt(0).toUpperCase() + user.role.slice(1)} 
                      color={
                        user.role === 'admin' ? 'secondary' : 
                        user.role === 'seller' ? 'primary' : 
                        'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{user.city}</TableCell>
                  <TableCell>
                    {user.approved ? (
                      <Chip label="Approved" color="success" size="small" />
                    ) : (
                      <Chip label="Pending" color="warning" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary" 
                      component={Link}
                      to={`/admin/users/${user.id}`}
                      title="View User Details"
                    >
                      <ViewIcon />
                    </IconButton>
                    {!user.approved && (
                      <IconButton 
                        color="success" 
                        onClick={() => handleApproveUser(user.id)}
                        title="Approve User"
                      >
                        <ApproveIcon />
                      </IconButton>
                    )}
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteClick(user)}
                      title="Delete User"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
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