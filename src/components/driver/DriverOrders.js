// src/components/driver/DriverOrders.js
import React from 'react';
import { Box } from '@mui/material';
import OrderList from '../Orders/OrderList';

const DriverOrders = () => {
  return (
    <Box>
      <OrderList role="driver" driverOnly={true} />
    </Box>
  );
};

export default DriverOrders;