// In src/pages/admin/UserManagement.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  Alert,
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
import { useTranslation } from 'react-i18next';

const UserManagement = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
  // State management
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
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // API call using useCallback to prevent recreation on every render
  const fetchUsers = useCallback(async () => {
    
    
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: page + 1, // API uses 1-based pagination, React uses 0-based
        page_size: rowsPerPage,
        role: filters.role || undefined,
        approved: filters.approved === 'true' ? true : 
                 filters.approved === 'false' ? false : undefined
      };
      
      const response = await getUsers(params);
      setUsers(response.results || []);
      setTotalCount(response.count || 0);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(t('user_management.errors.load_failed'));
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filters]);

  // Initial data load and when dependencies change
  useEffect(() => {
    // setLoading(true); // Set loading before fetchUsers to prevent immediate re-fetch
    const timer = setTimeout(() => {
      fetchUsers();
    }, 100); // Small delay to prevent rapid refetching
    
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  // Event handlers
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(0); // Reset to first page when filter changes
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
      setActionSuccess(t('user_management.success.user_deleted', { username: userToDelete.username }));
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      setError(t('user_management.errors.delete_failed', { message: err.message }));
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
      setActionSuccess(t('user_management.success.user_approved'));
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      setError(t('user_management.errors.approve_failed', { message: err.message }));
    }
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when rows per page changes
  };

  // Define columns for the responsive table
  const columns = [
    { key: 'username', label: t('user_management.table.username') },
    { 
      key: 'name', 
      label: t('user_management.table.name'),
      render: (value, row) => `${row.first_name || ''} ${row.last_name || ''}`.trim() || '-'
    },
    { key: 'email', label: t('user_management.table.email'), hidden: isMobile },
    { 
      key: 'role', 
      label: t('user_management.table.role'),
      render: (value, row) => (
        <Chip 
          label={row.role?.charAt(0).toUpperCase() + row.role?.slice(1) || ''} 
          color={
            row.role === 'admin' ? 'secondary' : 
            row.role === 'seller' ? 'primary' : 
            'default'
          }
          size="small"
        />
      )
    },
    { key: 'phone', label: t('user_management.table.phone'), hidden: isMobile },
    { key: 'city', label: t('user_management.table.city'), hidden: isMobile },
    { 
      key: 'approved', 
      label: t('user_management.table.status'),
      render: (value, row) => (
        row.approved ? (
          <Chip label={t('user_management.status.approved')} color="success" size="small" />
        ) : (
          <Chip label={t('user_management.status.pending')} color="warning" size="small" />
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
        title={t('user_management.actions.view_details')}
        size="small"
        onClick={(e) => e.stopPropagation()}
      >
        <ViewIcon />
      </IconButton>
      {!row.approved && (
        <IconButton 
          color="success" 
          onClick={(e) => {
            e.stopPropagation();
            handleApproveUser(row.id);
          }}
          title={t('user_management.actions.approve_user')}
          size="small"
        >
          <ApproveIcon />
        </IconButton>
      )}
      <IconButton 
        color="error" 
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteClick(row);
        }}
        title={t('user_management.actions.delete_user')}
        size="small"
      >
        <DeleteIcon />
      </IconButton>
    </Box>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        {t('user_management.title')}
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
          {showFilters ? t('user_management.filters.hide') : t('user_management.filters.show')} {t('user_management.filters.title')}
        </Button>
      </Box>
      
      {showFilters && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={2}>
            <FormControl sx={{ minWidth: 200, flexGrow: 1 }}>
              <InputLabel>{t('user_management.filters.role')}</InputLabel>
              <Select
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
                label={t('user_management.filters.role')}
              >
                <MenuItem value="">{t('user_management.filters.all_roles')}</MenuItem>
                <MenuItem value="admin">{t('user_management.roles.admin')}</MenuItem>
                <MenuItem value="seller">{t('user_management.roles.seller')}</MenuItem>
                <MenuItem value="driver">{t('user_management.roles.driver')}</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl sx={{ minWidth: 200, flexGrow: 1 }}>
              <InputLabel>{t('user_management.filters.approval_status')}</InputLabel>
              <Select
                name="approved"
                value={filters.approved}
                onChange={handleFilterChange}
                label={t('user_management.filters.approval_status')}
              >
                <MenuItem value="">{t('user_management.filters.all')}</MenuItem>
                <MenuItem value="true">{t('user_management.status.approved')}</MenuItem>
                <MenuItem value="false">{t('user_management.status.pending_approval')}</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>
      )}
      
      <ResponsiveTable
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage={t('user_management.empty_message')}
        onRowClick={(row) => navigate(`/admin/users/${row.id}`)}
        actions={renderActions}
        primaryKey="id"
        hasPagination={true}
        page={page}
        totalCount={totalCount}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        fullWidth={isMobile}
      >
        <DialogTitle>{t('user_management.dialog.delete_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('user_management.dialog.delete_confirm', { username: userToDelete?.username })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;