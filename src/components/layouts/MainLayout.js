import React, { useState, useEffect } from 'react';
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
  Divider,
  Badge
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  ShoppingCart as OrdersIcon,
  People as UsersIcon,
  Inventory as StockIcon,
  Person as ProfileIcon,
  Logout as LogoutIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { getMessages } from '../../api/messages';

const drawerWidth = 240;

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigate to dashboard based on user role
  const navigateToDashboard = () => {
    if (user?.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (user?.role === 'seller') {
      navigate('/seller/dashboard');
    } else if (user?.role === 'driver') {
      navigate('/driver/dashboard');
    }
  };

  // Check for unread messages
  useEffect(() => {
    const fetchUnreadMessages = async () => {
      try {
        const response = await getMessages();
        const messages = response.results || response;
        const unread = messages.filter(msg => 
          msg.status === 'unread' && msg.recipient?.id === user?.id
        ).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error fetching unread messages:', error);
      }
    };

    // Fetch initially
    fetchUnreadMessages();

    // Set up polling every 1 minute
    const interval = setInterval(fetchUnreadMessages, 60000);
    
    return () => clearInterval(interval);
  }, [user]);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Determine navigation items based on user role
  const getNavItems = () => {
    if (user?.role === 'admin') {
      return [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
        { text: 'User Management', icon: <UsersIcon />, path: '/admin/users' },
        { text: 'All Orders', icon: <OrdersIcon />, path: '/admin/orders' },
        { text: 'Stock Management', icon: <StockIcon />, path: '/admin/stock' },
        { 
          text: 'Messages', 
          icon: unreadCount > 0 ? (
            <Badge badgeContent={unreadCount} color="error">
              <EmailIcon />
            </Badge>
          ) : (
            <EmailIcon />
          ), 
          path: '/messages' 
        },
      ];
    } else if (user?.role === 'seller') {
      return [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/seller/dashboard' },
        { text: 'Orders', icon: <OrdersIcon />, path: '/seller/orders' },
        { text: 'Create Order', icon: <OrdersIcon />, path: '/seller/orders/create' },
        { text: 'Stock', icon: <StockIcon />, path: '/seller/stock' },
        { 
          text: 'Messages', 
          icon: unreadCount > 0 ? (
            <Badge badgeContent={unreadCount} color="error">
              <EmailIcon />
            </Badge>
          ) : (
            <EmailIcon />
          ), 
          path: '/messages' 
        },
      ];
    } else if (user?.role === 'driver') {
      return [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/driver/dashboard' },
        { text: 'My Orders', icon: <OrdersIcon />, path: '/driver/orders' },
        { 
          text: 'Messages', 
          icon: unreadCount > 0 ? (
            <Badge badgeContent={unreadCount} color="error">
              <EmailIcon />
            </Badge>
          ) : (
            <EmailIcon />
          ), 
          path: '/messages' 
        },
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
            Deleveryno - {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} Panel
          </Typography>
          {/* Message notification icon in toolbar */}
          <Button 
            color="inherit" 
            onClick={() => navigate('/messages')}
            sx={{ mr: 2 }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <EmailIcon />
            </Badge>
          </Button>
          {/* Username button - now redirects to dashboard */}
          <Button 
            color="inherit" 
            onClick={navigateToDashboard}
            sx={{ cursor: 'pointer' }}
          >
            {user?.username || 'Dashboard'}
          </Button>
          <Button 
            color="inherit" 
            onClick={handleLogout}
            sx={{ cursor: 'pointer', ml: 2 }}
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
            
            {/* Profile button - only visible for admins */}
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