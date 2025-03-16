// src/pages/seller/CreateOrder.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { createOrder } from '../../api/orders';
import { getStockItems } from '../../api/stock';

const CreateOrder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stockLoading, setStockLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stockItems, setStockItems] = useState([]);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    delivery_street: '',
    delivery_city: '',
    delivery_location: '',
    item: '',
    quantity: 1
  });

  useEffect(() => {
    const fetchStockItems = async () => {
      try {
        const response = await getStockItems();
        setStockItems(response.results || []);
      } catch (error) {
        console.error('Error fetching stock items:', error);
        setError('Failed to load inventory items. Please try again.');
      } finally {
        setStockLoading(false);
      }
    };

    fetchStockItems();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'delivery_location' && value) {
      const isValidMapsUrl = 
        value.startsWith('https://www.google.com/maps') || 
        value.startsWith('https://goo.gl/maps') || 
        value.startsWith('https://maps.app.goo.gl') ||
        value.startsWith('https://maps.google.com');
      
      if (!isValidMapsUrl && value.length > 0) {
        setError('Please provide a valid Google Maps link');
      } else {
        // Clear error if it was related to maps link
        if (error === 'Please provide a valid Google Maps link') {
          setError(null);
        }
      }
    }
    setFormData({
      ...formData,
      [name]: name === 'quantity' ? parseInt(value, 10) || 1 : value
    });
  };

  const validateForm = () => {
    const requiredFields = [
      'customer_name', 
      'customer_phone', 
      'delivery_street', 
      'delivery_city', 
      'item', 
      'quantity'
    ];
    
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`Please fill in all required fields`);
        return false;
      }
    }
    
    // Validate phone number format (simple validation)
    // const phoneRegex = /^\+?[0-9]{10,15}$/;
    // if (!phoneRegex.test(formData.customer_phone)) {
    //   setError('Please enter a valid phone number');
    //   return false;
    // }
    
    // Validate quantity is positive
    if (formData.quantity <= 0) {
      setError('Quantity must be greater than 0');
      return false;
    }
    
    // Check if selected item exists in stock
    const selectedItem = stockItems.find(item => item.item_name === formData.item);
    if (!selectedItem) {
      setError('Please select a valid item from your inventory');
      return false;
    }
    
    // Check if enough quantity is available
    if (selectedItem.quantity < formData.quantity) {
      setError(`Not enough ${selectedItem.item_name} in stock. Available: ${selectedItem.quantity}`);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await createOrder(formData);
      navigate('/seller/orders', { state: { success: 'Order created successfully!' } });
    } catch (err) {
      console.error('Error creating order:', err);
      if (err.response && err.response.data) {
        // Format error messages from API response
        const errorMessages = [];
        Object.keys(err.response.data).forEach(key => {
          const messages = err.response.data[key];
          if (Array.isArray(messages)) {
            errorMessages.push(`${key}: ${messages.join(', ')}`);
          } else {
            errorMessages.push(`${key}: ${messages}`);
          }
        });
        setError(errorMessages.join('\n'));
      } else {
        setError('Failed to create order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Create New Order
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom>
            Customer Information
          </Typography>
          
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Customer Name"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Customer Phone"
                name="customer_phone"
                value={formData.customer_phone}
                onChange={handleChange}
                required
                placeholder="e.g. +1234567890"
              />
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Delivery Address
          </Typography>
          
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                name="delivery_street"
                value={formData.delivery_street}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="delivery_city"
                value={formData.delivery_city}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Google Maps Link (optional)"
                name="delivery_location"
                value={formData.delivery_location}
                onChange={handleChange}
                placeholder="e.g. map:latitude,longitude"
              />
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Order Details
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <FormControl fullWidth required>
                <InputLabel>Item</InputLabel>
                <Select
                  name="item"
                  value={formData.item}
                  onChange={handleChange}
                  label="Item"
                >
                  {stockLoading ? (
                    <MenuItem disabled>Loading inventory...</MenuItem>
                  ) : stockItems.length === 0 ? (
                    <MenuItem disabled>No items in inventory</MenuItem>
                  ) : (
                    stockItems.map(item => (
                      <MenuItem 
                        key={item.id} 
                        value={item.item_name}
                        disabled={item.quantity === 0}
                      >
                        {item.item_name} {item.quantity === 0 ? '(Out of Stock)' : `(${item.quantity} available)`}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                required
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
          </Grid>
          
          <Box mt={4} display="flex" justifyContent="flex-end">
            <Button 
              type="button" 
              variant="outlined" 
              sx={{ mr: 2 }}
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading || stockLoading}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Order'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateOrder;