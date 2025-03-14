import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  Typography, 
  Button, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Container, 
  Divider 
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  ShoppingCart as OrdersIcon,
  People as UsersIcon,
  Inventory as StockIcon,
  Person as ProfileIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Determine navigation items based on user role
  const getNavItems = () => {
    if (user?.role === 'admin') {
      return [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
        { text: 'User Approval', icon: <UsersIcon />, path: '/admin/users' },
        { text: 'All Orders', icon: <OrdersIcon />, path: '/admin/orders' },
        { text: 'Stock Approval', icon: <StockIcon />, path: '/admin/stock' },
      ];
    } else if (user?.role === 'seller') {
      return [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/seller/dashboard' },
        { text: 'Orders', icon: <OrdersIcon />, path: '/seller/orders' },
        { text: 'Create Order', icon: <OrdersIcon />, path: '/seller/orders/create' },
        { text: 'Stock', icon: <StockIcon />, path: '/seller/stock' },
      ];
    } else if (user?.role === 'driver') {
      return [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/driver/dashboard' },
        { text: 'My Orders', icon: <OrdersIcon />, path: '/driver/orders' },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            DeliveryNo - {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} Panel
          </Typography>
          {/* Only show Profile button for admin */}
          {isAdmin && (
            <Button 
              color="inherit" 
              onClick={() => navigate('/profile')}
              sx={{ cursor: 'pointer' }}
            >
              {user?.username || 'Profile'}
            </Button>
          )}
          <Button 
            color="inherit" 
            onClick={handleLogout}
            sx={{ cursor: 'pointer' }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {navItems.map((item) => (
              <ListItem 
                button 
                key={item.text} 
                onClick={() => navigate(item.path)}
                sx={{ cursor: 'pointer' }}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
            <Divider />
            {/* Only show Profile item for admin */}
            {isAdmin && (
              <ListItem 
                button 
                onClick={() => navigate('/profile')}
                sx={{ cursor: 'pointer' }}
              >
                <ListItemIcon>
                  <ProfileIcon />
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItem>
            )}
            <ListItem 
              button 
              onClick={handleLogout}
              sx={{ cursor: 'pointer' }}
            >
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;