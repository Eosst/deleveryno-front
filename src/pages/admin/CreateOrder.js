import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import CreateOrder from '../seller/CreateOrder';

const AdminCreateOrder = () => {
  const { t } = useTranslation();

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Button 
          component={Link}
          to="/admin/orders"
          startIcon={<BackIcon />}
        >
          {t('orders.back_to_orders')}
        </Button>
      </Box>
      {/* <Typography variant="h4" mb={3}>
        {t('orders.create_new_order')}
      </Typography> */}
      <CreateOrder isAdmin={true} />
    </Box>
  );
};

export default AdminCreateOrder;
