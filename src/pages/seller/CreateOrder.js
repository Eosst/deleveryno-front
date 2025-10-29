// In src/pages/seller/CreateOrder.js - Add comment field to form

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
import { useTranslation } from 'react-i18next';

const CreateOrder = ({ isAdmin }) => {
  const { t } = useTranslation();
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
    quantity: 1,
    comment: '' // Add comment field to initial state
  });

  useEffect(() => {
    const fetchStockItems = async () => {
      try {
        const response = await getStockItems();
        // Filter to only include approved items
        const approvedItems = (response.results || []).filter(item => item.approved);
        setStockItems(approvedItems);
      } catch (error) {
        console.error('Error fetching stock items:', error);
        setError(t('create_order.errors.load_failed'));
      } finally {
        setStockLoading(false);
      }
    };

    fetchStockItems();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for location URL validation
    if (name === 'delivery_location' && value) {
      const isValidMapsUrl = 
        value.startsWith('https://www.google.com/maps') || 
        value.startsWith('https://goo.gl/maps') || 
        value.startsWith('https://maps.app.goo.gl') ||
        value.startsWith('https://maps.google.com');
      
      if (!isValidMapsUrl && value.length > 0) {
        setError(t('create_order.errors.invalid_maps_link'));
      } else {
        // Clear error if it was related to maps link
        if (error === t('create_order.errors.invalid_maps_link')) {
          setError(null);
        }
      }
    }
    
    setFormData({
      ...formData,
      [name]: name === 'quantity' ? (parseInt(value, 10) || 1) : value
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
        setError(t('create_order.errors.required_fields'));
        return false;
      }
    }
    
    // Validate quantity is positive
    if (formData.quantity <= 0) {
      setError(t('create_order.errors.invalid_quantity'));
      return false;
    }
    
    // Check if selected item exists in stock
    const selectedItem = stockItems.find(item => item.item_name === formData.item);
    if (!selectedItem) {
      setError(t('create_order.errors.invalid_item'));
      return false;
    }
    
    // Check if enough quantity is available
    if (selectedItem.quantity < formData.quantity) {
      setError(t('create_order.errors.not_enough_stock', { itemName: selectedItem.item_name, quantity: selectedItem.quantity }));
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
      navigate('/seller/orders', { state: { success: t('create_order.success.order_created') } });
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
        setError(t('create_order.errors.create_failed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {t('create_order.title')}
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom>
            {t('create_order.customer_information')}
          </Typography>
          
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('create_order.form.customer_name')}
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('create_order.form.customer_phone')}
                name="customer_phone"
                value={formData.customer_phone}
                onChange={handleChange}
                required
                placeholder={t('create_order.form.phone_placeholder')}
              />
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            {t('create_order.delivery_address')}
          </Typography>
          
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('create_order.form.street_address')}
                name="delivery_street"
                value={formData.delivery_street}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('create_order.form.city')}
                name="delivery_city"
                value={formData.delivery_city}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('create_order.form.maps_link')}
                name="delivery_location"
                value={formData.delivery_location}
                onChange={handleChange}
                placeholder={t('create_order.form.maps_placeholder')}
              />
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            {t('create_order.order_details')}
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <FormControl fullWidth required>
                <InputLabel>{t('create_order.form.item')}</InputLabel>
                <Select
                  name="item"
                  value={formData.item}
                  onChange={handleChange}
                  label={t('create_order.form.item')}
                >
                  {stockLoading ? (
                    <MenuItem disabled>{t('create_order.form.loading_inventory')}</MenuItem>
                  ) : stockItems.length === 0 ? (
                    <MenuItem disabled>{t('create_order.form.no_items')}</MenuItem>
                  ) : (
                    stockItems.map(item => (
                      <MenuItem 
                        key={item.id} 
                        value={item.item_name}
                        disabled={item.quantity === 0}
                      >
                        {item.item_name} {item.quantity === 0 ? t('create_order.form.out_of_stock') : t('create_order.form.quantity_available', { quantity: item.quantity })}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label={t('create_order.form.quantity')}
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                required
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            {/* Add comment field */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('create_order.form.comments')}
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                multiline
                rows={4}
                placeholder={t('create_order.form.comments_placeholder')}
                helperText={t('create_order.form.comments_helper')}
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
              {t('common.cancel')}
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading || stockLoading}
            >
              {loading ? <CircularProgress size={24} /> : t('create_order.create_button')}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateOrder;