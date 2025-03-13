// src/pages/seller/Dashboard.js
import React, { useState, useEffect , useContext } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { Link } from 'react-router-dom';
import { getSellerOrders } from '../../api/orders';
import { getStockItems } from '../../api/stock';
import { 
  ShoppingCart as OrderIcon, 
  Inventory as StockIcon, 
  LocalShipping as InTransitIcon,
  CheckCircle as DeliveredIcon,
  PendingActions as PendingIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const StatCard = ({ title, value, icon, color, loading, linkTo }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Box mr={2} sx={{ color }}>
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h3" component="div" sx={{ textAlign: 'center', mb: 2 }}>
          {loading ? <CircularProgress size={40} /> : value}
        </Typography>
      </CardContent>
      {linkTo && (
        <CardActions>
          <Button 
            component={Link} 
            to={linkTo} 
            size="small" 
            fullWidth
            variant="contained"
            color="primary"
          >
            View Details
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

const SellerDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    inTransit: 0,
    delivered: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch orders
        const ordersData = await getSellerOrders();
        const ordersList = Array.isArray(ordersData) ? ordersData : (ordersData.results || []);
        setOrders(ordersList);

        // Set recent orders (5 most recent)
        setRecentOrders(ordersList.slice(0, 5));

        // Calculate order statistics
        const pendingOrders = ordersList.filter(order => order.status === 'pending').length;
        const inTransitOrders = ordersList.filter(order => 
          order.status === 'in_transit' || order.status === 'assigned'
        ).length;
        const deliveredOrders = ordersList.filter(order => order.status === 'delivered').length;
        
        setOrderStats({
          total: ordersList.length,
          pending: pendingOrders,
          inTransit: inTransitOrders,
          delivered: deliveredOrders
        });

        // Fetch stock items
        const stockData = await getStockItems();
        const stockItems = stockData.results || [];
        
        // Find low stock items (quantity < 10)
        const lowStock = stockItems.filter(item => item.quantity < 10);
        setLowStockItems(lowStock);
      } catch (err) {
        console.error('Error fetching seller dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getOrderStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" />;
      case 'assigned':
        return <Chip label="Driver Assigned" color="info" size="small" />;
      case 'in_transit':
        return <Chip label="In Transit" color="primary" size="small" />;
      case 'delivered':
        return <Chip label="Delivered" color="success" size="small" />;
      case 'canceled':
        return <Chip label="Canceled" color="error" size="small" />;
      case 'no_answer':
        return <Chip label="No Answer" color="default" size="small" />;
      case 'postponed':
        return <Chip label="Postponed" color="secondary" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Seller Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Welcome back, {user?.first_name || user?.username}!
          </Typography>
        </Box>
        <Box>
          <Button
            component={Link}
            to="/seller/orders/create"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            Create New Order
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Total Orders" 
            value={orderStats.total} 
            icon={<OrderIcon fontSize="large" />} 
            color="primary.main" 
            loading={loading}
            linkTo="/seller/orders"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Pending" 
            value={orderStats.pending} 
            icon={<PendingIcon fontSize="large" />} 
            color="warning.main" 
            loading={loading}
            linkTo="/seller/orders?status=pending"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="In Transit" 
            value={orderStats.inTransit} 
            icon={<InTransitIcon fontSize="large" />} 
            color="info.main" 
            loading={loading}
            linkTo="/seller/orders?status=in_transit"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Delivered" 
            value={orderStats.delivered} 
            icon={<DeliveredIcon fontSize="large" />} 
            color="success.main" 
            loading={loading}
            linkTo="/seller/orders?status=delivered"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Orders
            </Typography>
            
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : recentOrders.length === 0 ? (
              <Typography variant="body1" color="textSecondary" align="center" py={3}>
                No orders found
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Customer</TableCell>
                      <TableCell>Item</TableCell>
                      <TableCell>Qty</TableCell>
                      <TableCell>City</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.customer_name}</TableCell>
                        <TableCell>{order.item}</TableCell>
                        <TableCell>{order.quantity}</TableCell>
                        <TableCell>{order.delivery_city}</TableCell>
                        <TableCell>{getOrderStatusChip(order.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button 
                component={Link} 
                to="/seller/orders" 
                color="primary"
              >
                View All Orders
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Low Stock Alert
            </Typography>
            
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : lowStockItems.length === 0 ? (
              <Typography variant="body1" color="textSecondary" align="center" py={3}>
                No low stock items
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell>Quantity</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lowStockItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.item_name}</TableCell>
                        <TableCell>
                          <Typography
                            color={item.quantity < 5 ? 'error' : 'warning.main'}
                            fontWeight="bold"
                          >
                            {item.quantity}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button 
                component={Link} 
                to="/seller/stock" 
                color="primary"
              >
                Manage Inventory
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SellerDashboard;