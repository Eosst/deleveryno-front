// src/components/seller/CreateOrder.js
import React from 'react';
import { Box } from '@mui/material';
import OrderForm from '../Orders/OrderForm';

const CreateOrder = () => {
  return (
    <Box>
      <OrderForm isEditing={false} />
    </Box>
  );
};

export default CreateOrder;