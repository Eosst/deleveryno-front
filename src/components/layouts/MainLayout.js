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
  Badge,
  IconButton,
  useMediaQuery,
  useTheme,
  SwipeableDrawer
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  ShoppingCart as OrdersIcon,
  People as UsersIcon,
  Inventory as StockIcon,
  Person as ProfileIcon,
  Logout as LogoutIcon,
  Email as EmailIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { getMessages } from '../../api/messages';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const drawerWidth = isMobile ? '85%' : 240;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Toggle drawer
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
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
    if (isMobile) {
      setMobileOpen(false);
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

  const drawer = (
    <Box>
      <Toolbar />
      <List>
        {navItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => {
              navigate(item.path);
              if (isMobile) setMobileOpen(false);
            }}
            sx={{ cursor: 'pointer' }}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <Divider />
        
        {/* Profile button - visible for all users */}
        <ListItem 
          button 
          onClick={() => {
            navigate('/profile');
            if (isMobile) setMobileOpen(false);
          }}
          sx={{ cursor: 'pointer' }}
        >
          <ListItemIcon>
            <ProfileIcon />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItem>
        
        <ListItem 
          button 
          onClick={() => {
            handleLogout();
            if (isMobile) setMobileOpen(false);
          }}
          sx={{ cursor: 'pointer' }}
        >
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography 
              variant="h6" 
              component="div" 
              noWrap
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              Deleveryno - {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} Panel
            </Typography>
            <Typography 
              variant="h6" 
              component="div"
              sx={{ display: { xs: 'block', sm: 'none' } }}
            >
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Message notification icon in toolbar */}
            <IconButton 
              color="inherit" 
              onClick={() => {
                navigate('/messages');
                if (isMobile) setMobileOpen(false);
              }}
              size={isMobile ? "small" : "medium"}
            >
              <Badge badgeContent={unreadCount} color="error">
                <EmailIcon />
              </Badge>
            </IconButton>
            
            {/* Username button - redirects to dashboard */}
            {!isMobile && (
              <Button 
                color="inherit" 
                onClick={navigateToDashboard}
                sx={{ cursor: 'pointer', ml: 1 }}
              >
                {user?.username || 'Dashboard'}
              </Button>
            )}
            
            {!isMobile && (
              <Button 
                color="inherit" 
                onClick={handleLogout}
                sx={{ cursor: 'pointer', ml: 1 }}
              >
                Logout
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
      {isMobile ? (
        <SwipeableDrawer
          open={mobileOpen}
          onClose={handleDrawerToggle}
          onOpen={() => setMobileOpen(true)}
          sx={{
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth 
            },
          }}
        >
          {drawer}
        </SwipeableDrawer>
      ) : (
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
          {drawer}
        </Drawer>
      )}
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, sm: 3 },
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` } 
        }}
      >
        <Toolbar />
        <Container maxWidth="lg" disableGutters={isMobile}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;