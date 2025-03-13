import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import CreateOrder from '../seller/CreateOrder';

const AdminCreateOrder = () => {
  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Button 
          component={Link}
          to="/admin/orders"
          startIcon={<BackIcon />}
        >
          Back to Orders
        </Button>
      </Box>
      <Typography variant="h4" mb={3}>Create New Order</Typography>
      <CreateOrder isAdmin={true} />
    </Box>
  );
};

export default AdminCreateOrder;