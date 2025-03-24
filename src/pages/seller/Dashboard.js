// src/pages/seller/Dashboard.js
import React, { useState, useEffect } from 'react';
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
  Chip,
  useMediaQuery,
  useTheme,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { getSellerOrders } from '../../api/orders';
import { getStockItems } from '../../api/stock';
import { 
  ShoppingCart as OrderIcon, 
  Inventory as StockIcon, 
  LocalShipping as InTransitIcon,
  CheckCircle as DeliveredIcon,
  PendingActions as PendingIcon,
  Add as AddIcon,
  Warning as WarningIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const StatCard = ({ title, value, icon, color, loading, linkTo }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        borderRadius: 2,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 6
        }
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Box 
            mr={2} 
            sx={{ 
              color,
              bgcolor: `${color}15`, // Add low opacity version of color as background
              p: 1.5,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography 
          variant="h3" 
          component="div" 
          sx={{ 
            textAlign: 'center', 
            mb: 2,
            fontSize: isMobile ? '2.5rem' : '3rem'
          }}
        >
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
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
      <Box 
        display="flex" 
        flexDirection={isMobile ? 'column' : 'row'}
        justifyContent="space-between" 
        alignItems={isMobile ? "stretch" : "center"} 
        mb={4}
      >
        <Box mb={isMobile ? 2 : 0}>
          <Typography variant="h4" gutterBottom>
            Seller Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Welcome back, {user?.first_name || user?.username}!
          </Typography>
        </Box>
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

      {/* RESTRUCTURED: Recent Orders Section moved to the top */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ p: 1 }}>
              Recent Orders
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : recentOrders.length === 0 ? (
              <Typography variant="body1" color="textSecondary" align="center" py={3}>
                No orders found
              </Typography>
            ) : isMobile ? (
              // Mobile list view
              <List sx={{ width: '100%' }}>
                {recentOrders.map((order) => (
                  <React.Fragment key={order.id}>
                    <ListItem 
                      component={Link} 
                      to={`/seller/orders/${order.id}`}
                      sx={{ 
                        textDecoration: 'none', 
                        color: 'inherit',
                        py: 2
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Typography variant="subtitle1">
                              {order.customer_name}
                            </Typography>
                            {getOrderStatusChip(order.status)}
                          </Box>
                        }
                        secondary={
                          <Box mt={1}>
                            <Typography variant="body2" color="textSecondary">
                              Item: {order.item} (Qty: {order.quantity})
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              City: {order.delivery_city}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              // Desktop table view
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
                      <TableRow 
                        key={order.id}
                        hover
                        onClick={() => navigate(`/seller/orders/${order.id}`)}
                        sx={{ cursor: 'pointer' }}
                      >
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
                endIcon={<ViewIcon />}
              >
                View All Orders
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* RESTRUCTURED: Low Stock Alerts moved below Recent Orders */}
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1 }}>
              <WarningIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Low Stock Alert
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : lowStockItems.length === 0 ? (
              <Typography variant="body1" color="textSecondary" align="center" py={3}>
                No low stock items
              </Typography>
            ) : (
              <List sx={{ width: '100%' }}>
                {lowStockItems.map((item) => (
                  <React.Fragment key={item.id}>
                    <ListItem>
                      <ListItemText
                        primary={item.item_name}
                        secondary={
                          <Typography
                            component="span"
                            variant="body2"
                            color={item.quantity < 5 ? "error" : "warning.main"}
                          >
                            {item.quantity === 0 ? "Out of Stock!" : `Only ${item.quantity} left in stock`}
                          </Typography>
                        }
                      />
                      <Chip 
                        label={item.quantity === 0 ? "Out of Stock" : "Low Stock"} 
                        color={item.quantity === 0 ? "error" : "warning"} 
                        size="small"
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
            
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button 
                component={Link} 
                to="/seller/stock" 
                color="primary"
                endIcon={<StockIcon />}
              >
                Manage Inventory
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* RESTRUCTURED: Stats cards moved below the other sections */}
      <Typography variant="h5" gutterBottom sx={{ mt: 2, mb: 3 }}>
        Order Statistics
      </Typography>
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Orders" 
            value={orderStats.total} 
            icon={<OrderIcon fontSize="large" />} 
            color={theme.palette.primary.main} 
            loading={loading}
            linkTo="/seller/orders"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Pending" 
            value={orderStats.pending} 
            icon={<PendingIcon fontSize="large" />} 
            color={theme.palette.warning.main} 
            loading={loading}
            linkTo="/seller/orders?status=pending"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="In Transit" 
            value={orderStats.inTransit} 
            icon={<InTransitIcon fontSize="large" />} 
            color={theme.palette.info.main} 
            loading={loading}
            linkTo="/seller/orders?status=in_transit"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Delivered" 
            value={orderStats.delivered} 
            icon={<DeliveredIcon fontSize="large" />} 
            color={theme.palette.success.main} 
            loading={loading}
            linkTo="/seller/orders?status=delivered"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default SellerDashboard;