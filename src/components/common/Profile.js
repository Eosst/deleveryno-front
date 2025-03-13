import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Grid, 
  Alert,
  CircularProgress 
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
  const { user, updateProfile, error: authError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    city: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProfileError('');
    setSuccess(false);
    
    try {
      await updateProfile(formData);
      setSuccess(true);
    } catch (err) {
      const errMsg = err.response?.data || {};
      // Format error messages
      const errors = Object.keys(errMsg).map(key => `${key}: ${errMsg[key]}`);
      setProfileError(errors.join(', ') || 'Profile update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Username: {user.username} | Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
      </Typography>
      
      {profileError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {profileError}
        </Alert>
      )}
      
      {authError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {authError}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Profile updated successfully!
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
        <Button 
          type="submit" 
          variant="contained" 
          sx={{ mt: 3 }}
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </Button>
      </Box>
    </Paper>
  );
};

export default Profile;