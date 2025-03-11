// src/components/admin/UserApproval.js
import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button, 
  Chip, 
  CircularProgress, 
  Alert
} from '@mui/material';
import axios from 'axios';

const UserApproval = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // In a real application, this would be an API call
      // const response = await axios.get('/api/users/');
      // Simulating API response
      setTimeout(() => {
        const mockUsers = [
          { id: 1, username: 'seller1', role: 'seller', first_name: 'John', last_name: 'Doe', is_active: false, date_joined: '2023-01-15' },
          { id: 2, username: 'driver1', role: 'driver', first_name: 'Jane', last_name: 'Smith', is_active: false, date_joined: '2023-01-16' },
          { id: 3, username: 'seller2', role: 'seller', first_name: 'Bob', last_name: 'Johnson', is_active: true, date_joined: '2023-01-10' },
        ];
        setUsers(mockUsers);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to load users. Please try again.');
      setLoading(false);
    }
  };

  const approveUser = async (userId) => {
    try {
      // In a real application, this would be an API call
      // await axios.patch(`/api/users/${userId}/approve/`);
      
      // Simulate API call
      setUsers(users.map(user => {
        if (user.id === userId) {
          return { ...user, is_active: true };
        }
        return user;
      }));
      
      setActionSuccess('User approved successfully!');
      // Clear success message after 3 seconds
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setError('Failed to approve user. Please try again.');
      // Clear error message after 3 seconds
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        User Approval
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
      
      <Paper elevation={3} sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={200}>
              <CircularProgress />
            </Box>
          ) : (
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date Joined</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{`${user.first_name} ${user.last_name}`}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role.charAt(0).toUpperCase() + user.role.slice(1)} 
                          color={user.role === 'seller' ? 'primary' : 'secondary'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.is_active ? 'Active' : 'Pending'} 
                          color={user.is_active ? 'success' : 'warning'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>{new Date(user.date_joined).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {!user.is_active && (
                          <Button 
                            variant="contained" 
                            color="success" 
                            size="small"
                            onClick={() => approveUser(user.id)}
                          >
                            Approve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default UserApproval;