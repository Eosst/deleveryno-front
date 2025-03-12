// src/components/Admine/AllOrders.js
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Grid,
  Paper
} from '@mui/material';
import OrderList from '../Orders/OrderList';

const AllOrders = () => {
  const [statusFilter, setStatusFilter] = useState('all');

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        All Orders
      </Typography>
      
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={handleStatusChange}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="assigned">Driver Assigned</MenuItem>
                <MenuItem value="in_transit">In Transit</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="canceled">Canceled</MenuItem>
                <MenuItem value="no_answer">No Answer</MenuItem>
                <MenuItem value="postponed">Postponed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      <OrderList role="admin" />
    </Box>
  );
};

export default AllOrders;