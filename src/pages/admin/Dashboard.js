import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress
} from '@mui/material';
import { getUsers } from '../../api/users';
import { getOrders } from '../../api/orders';
import { getStockItems } from '../../api/stock';
import {
  PeopleAlt as UserIcon,
  LocalShipping as OrderIcon,
  Inventory as StockIcon,
  SupervisorAccount as AdminIcon,
  Store as SellerIcon,
  DirectionsCar as DriverIcon,
  ShoppingCart as PendingIcon,
  CheckCircle as DeliveredIcon,
  LocalShipping as InTransitIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const StatCard = ({ title, value, icon, color, loading, linkTo }) => (
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
          {title}
        </Button>
      </CardActions>
    )}
  </Card>
);

const AdminDashboard = () => {
  const { t } = useTranslation();

  const [userStats, setUserStats] = useState({ total: 0, pending: 0, roles: {} });
  const [orderStats, setOrderStats] = useState({ total: 0, pending: 0, inTransit: 0, delivered: 0 });
  const [stockStats, setStockStats] = useState({ total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await getUsers();
        const users = usersData.results || [];

        const pendingUsers = users.filter(user => !user.approved).length;
        const roles = users.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {});

        setUserStats({ total: users.length, pending: pendingUsers, roles });

        const ordersData = await getOrders();
        const orders = ordersData.results || [];

        const pendingOrders = orders.filter(order => order.status === 'pending').length;
        const inTransitOrders = orders.filter(order => order.status === 'in_transit').length;
        const deliveredOrders = orders.filter(order => order.status === 'delivered').length;

        setOrderStats({
          total: orders.length,
          pending: pendingOrders,
          inTransit: inTransitOrders,
          delivered: deliveredOrders
        });

        const stockData = await getStockItems();
        const stockItems = stockData.results || [];

        setStockStats({ total: stockItems.length });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {t('dashboard.title')}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 4 }}>
        {t('dashboard.subtitle')}
      </Typography>

      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        {t('dashboard.user_stats')}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title={t('dashboard.total_users')} value={userStats.total} icon={<UserIcon fontSize="large" />} color="primary.main" loading={loading} linkTo="/admin/users" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title={t('dashboard.pending_approvals')} value={userStats.pending} icon={<PendingIcon fontSize="large" />} color="warning.main" loading={loading} linkTo="/admin/users" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title={t('dashboard.sellers')} value={userStats.roles.seller || 0} icon={<SellerIcon fontSize="large" />} color="info.main" loading={loading} linkTo="/admin/users" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title={t('dashboard.drivers')} value={userStats.roles.driver || 0} icon={<DriverIcon fontSize="large" />} color="success.main" loading={loading} linkTo="/admin/users" />
        </Grid>
      </Grid>

      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        {t('dashboard.order_stats')}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title={t('dashboard.total_orders')} value={orderStats.total} icon={<OrderIcon fontSize="large" />} color="primary.main" loading={loading} linkTo="/admin/orders" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title={t('dashboard.pending_orders')} value={orderStats.pending} icon={<PendingIcon fontSize="large" />} color="warning.main" loading={loading} linkTo="/admin/orders" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title={t('dashboard.in_transit')} value={orderStats.inTransit} icon={<InTransitIcon fontSize="large" />} color="info.main" loading={loading} linkTo="/admin/orders" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title={t('dashboard.delivered')} value={orderStats.delivered} icon={<DeliveredIcon fontSize="large" />} color="success.main" loading={loading} linkTo="/admin/orders" />
        </Grid>
      </Grid>

      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        {t('dashboard.inventory')}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title={t('dashboard.total_stock')} value={stockStats.total} icon={<StockIcon fontSize="large" />} color="primary.main" loading={loading} linkTo="/admin/stock" />
        </Grid>
      </Grid>

      <Box mt={4} display="flex" justifyContent="center">
        <Grid container spacing={3} maxWidth="md">
          <Grid item xs={12} sm={6}>
            <Button
              component={Link}
              to="/admin/orders/create"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{ py: 2 }}
            >
              {t('dashboard.create_order')}
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              component={Link}
              to="/admin/users"
              variant="outlined"
              color="primary"
              size="large"
              fullWidth
              sx={{ py: 2 }}
            >
              {t('dashboard.manage_approvals')}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
