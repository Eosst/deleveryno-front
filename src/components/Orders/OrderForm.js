// src/components/Orders/OrderForm.js
import React, { useState, useEffect, useContext } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Grid, 
  CircularProgress, 
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../contexts/AuthContext';

const OrderForm = ({ isEditing = false }) => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    delivery_address: '',
    item: '',
    quantity: 1
  });
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Fetch addresses and stock items (for autocomplete)
    fetchAddresses();
    fetchStockItems();
    
    // If editing, fetch order data
    if (isEditing && id) {
      fetchOrderData();
    }
  }, [isEditing, id]);

  const fetchAddresses = async () => {
    try {
      const response = await axios.get('/addresses/');
      setAddresses(response.data);
    } catch (err) {
      console.error('Error fetching addresses:', err);
    }
  };

  const fetchStockItems = async () => {
    try {
      const response = await axios.get('/stock/');
      setStockItems(response.data);
    } catch (err) {
      console.error('Error fetching stock items:', err);
    }
  };

  const fetchOrderData = async () => {
    setFetchLoading(true);
    try {
      const response = await axios.get(`/orders/${id}/`);
      const order = response.data;
      
      setFormData({
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        delivery_address: order.delivery_address?.id || '',
        item: order.item,
        quantity: order.quantity
      });
      
      if (order.delivery_address) {
        setSelectedAddress(order.delivery_address);
      }
    } catch (err) {
      setError('Failed to load order data. Please try again.');
      console.error('Error fetching order data:', err);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value > 0) {
      setFormData({
        ...formData,
        quantity: value
      });
    }
  };

  const handleAddressChange = (event, newValue) => {
    setSelectedAddress(newValue);
    setFormData({
      ...formData,
      delivery_address: newValue?.id || ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const payload = {
        ...formData
      };
      
      let response;
      
      if (isEditing) {
        response = await axios.put(`/api/orders/${id}/`, payload);
        setSuccess('Order updated successfully');
      } else {
        response = await axios.post('/api/orders/', payload);
        setSuccess('Order created successfully');
        // Reset form after successful creation
        setFormData({
          customer_name: '',
          customer_phone: '',
          delivery_address: '',
          item: '',
          quantity: 1
        });
        setSelectedAddress(null);
      }
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(isEditing ? `/orders/${id}` : '/seller/orders');
      }, 2000);
    } catch (err) {
      const errMsg = err.response?.data || {};
      // Format error messages
      const errors = Object.keys(errMsg).map(key => `${key}: ${errMsg[key]}`);
      setError(errors.join(', ') || 'Failed to save order. Please try again.');
      console.error('Error saving order:', err);
    } finally {
      setLoading(false);
    }
  };

  // User is not a seller and not editing own order, don't allow access
  if (user.role !== 'seller' && !(isEditing && user.role === 'admin')) {
    return (
      <Box>
        <Alert severity="error">
          You don't have permission to {isEditing ? 'edit' : 'create'} orders.
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
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        {isEditing ? 'Edit Order' : 'Create New Order'}
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
          {/* Customer Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Customer Information
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Customer Name"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Customer Phone"
              name="customer_phone"
              value={formData.customer_phone}
              onChange={handleChange}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Autocomplete
              value={selectedAddress}
              onChange={handleAddressChange}
              options={addresses}
              getOptionLabel={(option) => `${option.street}, ${option.city}`}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  label="Delivery Address"
                  helperText="Select an existing address or create a new one"
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => navigate('/addresses/new')}
              sx={{ mb: 2 }}
            >
              Create New Address
            </Button>
          </Grid>
          
          {/* Order Details */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Order Details
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={8}>
            <Autocomplete
              freeSolo
              value={formData.item}
              onChange={(event, newValue) => {
                setFormData({
                  ...formData,
                  item: newValue
                });
              }}
              inputValue={formData.item}
              onInputChange={(event, newInputValue) => {
                setFormData({
                  ...formData,
                  item: newInputValue
                });
              }}
              options={stockItems.map((option) => option.item_name)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  label="Item"
                  name="item"
                  helperText="Select from your stock or enter a new item"
                />
              )}
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              required
              fullWidth
              label="Quantity"
              name="quantity"
              type="number"
              InputProps={{ inputProps: { min: 1 } }}
              value={formData.quantity}
              onChange={handleQuantityChange}
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
            {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Order' : 'Create Order')}
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default OrderForm;