import React from 'react';
import { useParams } from 'react-router-dom';
import OrderDetail from '../../pages/admin/OrderDetail';

const DriverOrderDetail = () => {
  const { id } = useParams();
  
  return <OrderDetail id={id} userRole="driver" />;
};

export default DriverOrderDetail;