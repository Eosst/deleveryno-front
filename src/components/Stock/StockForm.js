// src/components/Stock/StockForm.js
import React, { useState, useEffect, useContext } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Grid, 
  CircularProgress, 
  Alert
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../contexts/AuthContext';

const StockForm = ({ isEditing = false }) => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    item_name: '',
    quantity: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // If editing, fetch stock item data
    if (isEditing && id) {
      fetchStockData();
    }
  }, [isEditing, id]);

  const fetchStockData = async () => {
    setFetchLoading(true);
    try {
      const response = await axios.get(`/api/stock/${id}/`);
      const stock = response.data;
      
      setFormData({
        item_name: stock.item_name,
        quantity: stock.quantity
      });
    } catch (err) {
      setError('Failed to load stock data. Please try again.');
      console.error('Error fetching stock data:', err);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'quantity' ? parseInt(value, 10) || 0 : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      let response;
      
      if (isEditing) {
        response = await axios.put(`/api/stock/${id}/`, formData);
        setSuccess('Stock item updated successfully');
      } else {
        response = await axios.post('/api/stock/', formData);
        setSuccess('Stock item created successfully');
        // Reset form after successful creation
        setFormData({
          item_name: '',
          quantity: 0
        });
      }
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/seller/stock');
      }, 2000);
    } catch (err) {
      const errMsg = err.response?.data || {};
      // Format error messages
      const errors = Object.keys(errMsg).map(key => `${key}: ${errMsg[key]}`);
      setError(errors.join(', ') || 'Failed to save stock item. Please try again.');
      console.error('Error saving stock item:', err);
    } finally {
      setLoading(false);
    }
  };

  // User is not a seller, don't allow access
  if (user.role !== 'seller') {
    return (
      <Box>
        <Alert severity="error">
          You don't have permission to manage stock items.
        </Alert>
        <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  if (fetchLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        {isEditing ? 'Edit Stock Item' : 'Add New Stock Item'}
      </Typography>
      
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
      
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Item Name"
              name="item_name"
              value={formData.item_name}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Quantity"
              name="quantity"
              type="number"
              InputProps={{ inputProps: { min: 0 } }}
              value={formData.quantity}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Stock' : 'Add to Stock')}
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => navigate('/seller/stock')}
            disabled={loading}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default StockForm;