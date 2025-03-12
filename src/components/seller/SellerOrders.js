// src/components/seller/SellerOrders.js
import React from 'react';
import { Box } from '@mui/material';
import OrderList from '../Orders/OrderList';

const SellerOrders = () => {
  return (
    <Box>
      <OrderList role="seller" sellerOnly={true} />
    </Box>
  );
};

export default SellerOrders;