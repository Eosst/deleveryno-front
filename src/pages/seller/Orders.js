// src/pages/seller/Orders.js
import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  IconButton,
  useMediaQuery,
  useTheme,
  Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { getSellerOrders } from '../../api/orders';
import ResponsiveTable from '../../components/common/ResponsiveTable';

const SellerOrders = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(location.state?.success || null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    delivery_city: '',
    customer_name: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Status counts for quick filter buttons
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    assigned: 0,
    in_transit: 0,
    delivered: 0
  });

  useEffect(() => {
    fetchOrders();
    
    // Clear success message after 3 seconds
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [page, rowsPerPage, filters]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getSellerOrders();
      
      // Process the response data - store in a local variable first
      let orderData = [];
      
      // Handle both paginated and non-paginated responses
      if (response && response.results) {
        orderData = response.results;
        setTotalCount(response.count || 0);
      } else if (Array.isArray(response)) {
        orderData = response;
        setTotalCount(response.length);
      }
      
      // Calculate status counts before applying filters
      const counts = {
        pending: orderData.filter(order => order.status === 'pending').length,
        assigned: orderData.filter(order => order.status === 'assigned').length,
        in_transit: orderData.filter(order => order.status === 'in_transit').length,
        delivered: orderData.filter(order => order.status === 'delivered').length
      };
      setStatusCounts(counts);
      
      // Apply filters to the fetched data (not to the current state)
      let filteredData = [...orderData]; // Create a copy to work with
      
      if (filters.status) {
        filteredData = filteredData.filter(order => order.status === filters.status);
      }
      
      if (filters.delivery_city) {
        filteredData = filteredData.filter(order => 
          order.delivery_city && order.delivery_city.toLowerCase().includes(filters.delivery_city.toLowerCase())
        );
      }
      
      if (filters.customer_name) {
        filteredData = filteredData.filter(order => 
          order.customer_name && order.customer_name.toLowerCase().includes(filters.customer_name.toLowerCase())
        );
      }
      
      // Set state only once with the processed data
      setOrders(filteredData);
      
      // Update total count if needed
      if (!response.count) {
        setTotalCount(filteredData.length);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
      setOrders([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(0);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      customer_name: searchTerm
    }));
    setPage(0);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handler for quick filter buttons
  const handleQuickFilter = (status) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status === status ? '' : status // Toggle filter if already active
    }));
    setPage(0);
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" />;
      case 'assigned':
        return <Chip label="Assigned" color="primary" size="small" />;
      case 'in_transit':
        return <Chip label="In Transit" color="info" size="small" />;
      case 'delivered':
        return <Chip label="Delivered" color="success" size="small" />;
      case 'canceled':
        return <Chip label="Canceled" color="error" size="small" />;
      case 'no_answer':
        return <Chip label="No Answer" color="default" size="small" />;
      case 'postponed':
        return <Chip label="Postponed" color="secondary" size="small" />;
      default:
        return <Chip label={status || "Unknown"} size="small" />;
    }
  };

  // This slices the orders array based on pagination settings
  const paginatedOrders = orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Define table columns
  const columns = [
    { key: 'id', label: 'Order ID' },
    { key: 'customer_name', label: 'Customer' },
    { key: 'item', label: 'Item' },
    { key: 'quantity', label: 'Qty', hidden: isMobile },
    { key: 'delivery_city', label: 'Delivery City', hidden: isMobile },
    { 
      key: 'status', 
      label: 'Status',
      render: (value, row) => getStatusChip(value)
    },
    { 
      key: 'created_at', 
      label: 'Created', 
      hidden: isMobile,
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center',
      render: (value, row) => (
        <IconButton
          color="primary"
          size="small"
          component={Link}
          to={`/seller/orders/${row.id}`}
          title="View Details"
        >
          <ViewIcon />
        </IconButton>
      )
    }
  ];

  return (
    <Box>
      <Box 
        display="flex" 
        flexDirection={isMobile ? 'column' : 'row'} 
        justifyContent="space-between" 
        alignItems={isMobile ? "stretch" : "center"} 
        mb={3}
      >
        <Typography variant="h4" sx={{ mb: isMobile ? 2 : 0 }}>My Orders</Typography>
        <Button
          component={Link}
          to="/seller/orders/create"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          fullWidth={isMobile}
        >
          Create New Order
        </Button>
      </Box>

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

      {/* NEW: Quick filter buttons */}
      <Stack 
        direction="row" 
        spacing={1} 
        sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}
        justifyContent={isMobile ? "center" : "flex-start"}
      >
        <Button
          variant={filters.status === 'pending' ? 'contained' : 'outlined'}
          color="warning"
          onClick={() => handleQuickFilter('pending')}
          size="small"
        >
          Pending ({statusCounts.pending})
        </Button>
        <Button
          variant={filters.status === 'assigned' ? 'contained' : 'outlined'}
          color="primary"
          onClick={() => handleQuickFilter('assigned')}
          size="small"
        >
          Assigned ({statusCounts.assigned})
        </Button>
        <Button
          variant={filters.status === 'in_transit' ? 'contained' : 'outlined'}
          color="info"
          onClick={() => handleQuickFilter('in_transit')}
          size="small"
        >
          In Transit ({statusCounts.in_transit})
        </Button>
        <Button
          variant={filters.status === 'delivered' ? 'contained' : 'outlined'}
          color="success"
          onClick={() => handleQuickFilter('delivered')}
          size="small"
        >
          Delivered ({statusCounts.delivered})
        </Button>
        <Button
          variant={filters.status === '' ? 'contained' : 'outlined'}
          color="secondary"
          onClick={() => handleQuickFilter('')}
          size="small"
        >
          All Orders
        </Button>
      </Stack>

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by customer name..."
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Button onClick={handleSearch} variant="text">
                      Search
                    </Button>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} display="flex" justifyContent="flex-end">
            <Button
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              variant="outlined"
              fullWidth={isMobile}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </Grid>
          
          {showFilters && (
            <>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Filter by Status</InputLabel>
                  <Select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    label="Filter by Status"
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="assigned">Assigned</MenuItem>
                    <MenuItem value="in_transit">In Transit</MenuItem>
                    <MenuItem value="delivered">Delivered</MenuItem>
                    <MenuItem value="canceled">Canceled</MenuItem>
                    <MenuItem value="no_answer">No Answer</MenuItem>
                    <MenuItem value="postponed">Postponed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Filter by City"
                  name="delivery_city"
                  value={filters.delivery_city}
                  onChange={handleFilterChange}
                />
              </Grid>
              <Grid item xs={12} md={4} display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  onClick={() => {
                    setFilters({
                      status: '',
                      delivery_city: '',
                      customer_name: ''
                    });
                    setSearchTerm('');
                  }}
                  fullWidth={isMobile}
                >
                  Reset Filters
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      {/* Responsive Orders Table */}
      <ResponsiveTable
        columns={columns}
        data={paginatedOrders}
        loading={loading}
        emptyMessage="No orders found"
        onRowClick={(row) => navigate(`/seller/orders/${row.id}`)}
        primaryKey="id"
      />
    </Box>
  );
};

export default SellerOrders;