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
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isRTL = i18n.dir() === 'rtl';
  const drawerWidth = isMobile ? '85%' : 240;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

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

    fetchUnreadMessages();
    const interval = setInterval(fetchUnreadMessages, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const getNavItems = () => {
    if (user?.role === 'admin') {
      return [
        { text: t('nav.dashboard'), icon: <DashboardIcon />, path: '/admin/dashboard' },
        { text: t('nav.users'), icon: <UsersIcon />, path: '/admin/users' },
        { text: t('nav.orders'), icon: <OrdersIcon />, path: '/admin/orders' },
        { text: t('nav.stock'), icon: <StockIcon />, path: '/admin/stock' },
        {
          text: t('nav.messages'),
          icon: unreadCount > 0 ? (
            <Badge badgeContent={unreadCount} color="error"><EmailIcon /></Badge>
          ) : <EmailIcon />,
          path: '/messages'
        }
      ];
    } else if (user?.role === 'seller') {
      return [
        { text: t('nav.dashboard'), icon: <DashboardIcon />, path: '/seller/dashboard' },
        { text: t('nav.orders'), icon: <OrdersIcon />, path: '/seller/orders' },
        { text: t('nav.create_order'), icon: <OrdersIcon />, path: '/seller/orders/create' },
        { text: t('nav.stock'), icon: <StockIcon />, path: '/seller/stock' },
        {
          text: t('nav.messages'),
          icon: unreadCount > 0 ? (
            <Badge badgeContent={unreadCount} color="error"><EmailIcon /></Badge>
          ) : <EmailIcon />,
          path: '/messages'
        }
      ];
    } else if (user?.role === 'driver') {
      return [
        { text: t('nav.dashboard'), icon: <DashboardIcon />, path: '/driver/dashboard' },
        { text: t('nav.my_orders'), icon: <OrdersIcon />, path: '/driver/orders' },
        {
          text: t('nav.messages'),
          icon: unreadCount > 0 ? (
            <Badge badgeContent={unreadCount} color="error"><EmailIcon /></Badge>
          ) : <EmailIcon />,
          path: '/messages'
        }
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
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} sx={{ textAlign: isRTL ? 'right' : 'left' }} />
          </ListItem>
        ))}
        <Divider />
        <ListItem button onClick={() => { navigate('/profile'); if (isMobile) setMobileOpen(false); }}>
          <ListItemIcon><ProfileIcon /></ListItemIcon>
          <ListItemText primary={t('nav.profile')} sx={{ textAlign: isRTL ? 'right' : 'left' }} />
        </ListItem>
        <ListItem button onClick={() => { handleLogout(); if (isMobile) setMobileOpen(false); }}>
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary={t('nav.logout')} sx={{ textAlign: isRTL ? 'right' : 'left' }} />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }} dir={i18n.dir()}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ display: 'flex', flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between' }}>
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
            <Typography variant="h6" component="div" noWrap>
              Deleveryno - {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} Panel
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LanguageSwitcher />
            <IconButton color="inherit" onClick={() => navigate('/messages')}>
              <Badge badgeContent={unreadCount} color="error">
                <EmailIcon />
              </Badge>
            </IconButton>
            {!isMobile && (
              <Button color="inherit" onClick={navigateToDashboard} sx={{ cursor: 'pointer', ml: 1 }}>
                {user?.username || t('nav.dashboard')}
              </Button>
            )}
            {!isMobile && (
              <Button color="inherit" onClick={handleLogout} sx={{ cursor: 'pointer', ml: 1 }}>
                {t('nav.logout')}
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {isMobile ? (
        <SwipeableDrawer
          anchor={isRTL ? 'right' : 'left'}
          open={mobileOpen}
          onClose={handleDrawerToggle}
          onOpen={() => setMobileOpen(true)}
          sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
        >
          {drawer}
        </SwipeableDrawer>
      ) : (
        <Drawer
          anchor={isRTL ? 'right' : 'left'}
          variant="permanent"
          sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}
        >
          {drawer}
        </Drawer>
      )}

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        <Container maxWidth="lg" disableGutters={isMobile}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
