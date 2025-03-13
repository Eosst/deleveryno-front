import React from 'react';
import { useParams } from 'react-router-dom';
import OrderDetail from '../../pages/admin/OrderDetail';

const SellerOrderDetail = () => {
  const { id } = useParams();
  
  return <OrderDetail id={id} userRole="seller" />;
};

export default SellerOrderDetail;