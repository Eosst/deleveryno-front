// src/components/Addresses/AddressForm.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Grid, 
  Typography, 
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import axios from 'axios';

const AddressForm = ({ addressId = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    street_address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    is_default: false
  });
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (addressId) {
      fetchAddress();
    }
  }, [addressId]);
  
  const fetchAddress = async () => {
    if (!addressId) return;
    
    setFetchLoading(true);
    try {
      // In a real app, this would be an API call
      // const response = await axios.get(`/api/addresses/${addressId}/`);
      // setFormData(response.data);
      
      // Simulate API response
      setTimeout(() => {
        setFormData({
          name: 'Home',
          street_address: '123 Main St',
          city: 'New York',
          state: 'NY',
          postal_code: '10001',
          country: 'USA',
          is_default: true
        });
        setFetchLoading(false);
      }, 500);
    } catch (err) {
      setError('Failed to load address data');
      setFetchLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      let response;
      if (addressId) {
        // Update existing address
        // response = await axios.put(`/api/addresses/${addressId}/`, formData);
      } else {
        // Create new address
        // response = await axios.post('/api/addresses/', formData);
      }
      
      // Simulate successful save
      setTimeout(() => {
        onSave(formData);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError('Failed to save address. Please check your information and try again.');
      setLoading(false);
    }
  };
  
  if (fetchLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {addressId ? 'Edit Address' : 'Add New Address'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Home, Office, etc."
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Street Address"
              name="street_address"
              value={formData.street_address}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="State/Province"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Postal Code"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
            />
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Address'}
          </Button>
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default AddressForm;