// src/components/messaging/MessageList.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Button,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
  Avatar,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import { Link } from 'react-router-dom';
import { getMessages } from '../../api/messages';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Add as AddIcon,
  Circle as UnreadIcon,
  Check as ReadIcon,
  Archive as ArchiveIcon, 
  ChevronRight as RightIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const MessageList = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation();
  
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getMessages();
      setMessages(response.results || response || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(t('messages.list.errors.failedLoad'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'unread':
        return <Chip icon={<UnreadIcon fontSize="small" />} label={t('messages.status.unread')} color="error" size="small" />;
      case 'read':
        return <Chip icon={<ReadIcon fontSize="small" />} label={t('messages.status.read')} color="primary" size="small" />;
      case 'archived':
        return <Chip icon={<ArchiveIcon fontSize="small" />} label={t('messages.status.archived')} color="default" size="small" />;
      default:
        return <Chip label={status || t('messages.common.unknown')} size="small" />;
    }
  };

  // Format sender/recipient name
  const formatUserName = (messageUser, userRole) => {
    if (!messageUser) return t('messages.common.unknown');
    
    // If the user is not an admin and the message user is an admin, show as "Administration"
    if (!isAdmin && userRole === 'admin') {
      return t('messages.common.administration');
    }
    
    // Otherwise show the actual user name
    return messageUser.first_name && messageUser.last_name
      ? `${messageUser.first_name} ${messageUser.last_name}`
      : messageUser.username || t('messages.common.unknown');
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name || name === t('messages.common.administration')) return "A";
    if (name === t('messages.common.unknown')) return "?";
    
    const parts = name.split(" ");
    if (parts.length === 1) return name.charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  };

  // Get avatar color based on role
  const getAvatarColor = (role) => {
    switch (role) {
      case 'admin':
        return theme.palette.secondary.main;
      case 'seller':
        return theme.palette.primary.main;
      case 'driver':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={3}
        flexDirection={isMobile ? "column" : "row"}
      >
        <Typography variant="h4" sx={{ mb: isMobile ? 2 : 0 }}>{t('messages.list.title')}</Typography>
        <Button
          component={Link}
          to="/messages/new"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          fullWidth={isMobile}
        >
          {t('messages.list.newMessage')}
        </Button>
      </Box>

      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {messages.length === 0 ? (
          <Box p={3} textAlign="center">
            <Typography variant="body1" color="textSecondary">
              {t('messages.list.noneFound')}
            </Typography>
          </Box>
        ) : isMobile ? (
          // Mobile view - cards instead of list
          <Box p={2}>
            {messages.map((message) => {
              if (!message || !message.sender || !message.recipient) {
                return null; // Skip invalid messages
              }
              
              return (
                <Card 
                  key={message.id}
                  sx={{ 
                    mb: 2, 
                    bgcolor: message.status === 'unread' && message.recipient.id === user?.id ? 'action.hover' : 'inherit',
                    borderLeft: message.status === 'unread' && message.recipient.id === user?.id ? `4px solid ${theme.palette.error.main}` : 'none'
                  }}
                  component={Link}
                  to={`/messages/${message.id}`}
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Box display="flex" alignItems="center">
                        <Avatar 
                          sx={{ 
                            bgcolor: message.sender.id === user?.id 
                              ? getAvatarColor(message.recipient.role) 
                              : getAvatarColor(message.sender.role),
                            width: 32, 
                            height: 32,
                            mr: 1
                          }}
                        >
                          {message.sender.id === user?.id 
                            ? getInitials(formatUserName(message.recipient, message.recipient.role)) 
                            : getInitials(formatUserName(message.sender, message.sender.role))}
                        </Avatar>
                        <Typography 
                          variant="subtitle2"
                          sx={{
                            fontWeight: message.status === 'unread' && message.recipient.id === user?.id ? 'bold' : 'regular'
                          }}
                        >
                          {message.sender.id === user?.id 
                            ? `To: ${formatUserName(message.recipient, message.recipient.role)}` 
                            : `From: ${formatUserName(message.sender, message.sender.role)}`}
                        </Typography>
                      </Box>
                      {getStatusChip(message.status)}
                    </Box>

                    <Typography 
                      variant="body2"
                      sx={{
                        fontWeight: message.status === 'unread' && message.recipient.id === user?.id ? 'bold' : 'regular',
                        mb: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {message.subject}
                    </Typography>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="textSecondary">
                        {new Date(message.created_at).toLocaleDateString()}
                      </Typography>
                      <IconButton size="small" color="primary">
                        <RightIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        ) : (
          // Desktop view - list
          <List sx={{ p: 0 }}>
            {messages.map((message) => {
              if (!message || !message.sender || !message.recipient) {
                return null; // Skip invalid messages
              }
              
              return (
                <React.Fragment key={message.id}>
                  <ListItem
                    button
                    component={Link}
                    to={`/messages/${message.id}`}
                    sx={{
                      bgcolor: message.status === 'unread' && message.recipient.id === user?.id ? 'action.hover' : 'inherit',
                      py: 2
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        bgcolor: message.sender.id === user?.id 
                          ? getAvatarColor(message.recipient.role) 
                          : getAvatarColor(message.sender.role),
                        mr: 2
                      }}
                    >
                      {message.sender.id === user?.id 
                        ? getInitials(formatUserName(message.recipient, message.recipient.role)) 
                        : getInitials(formatUserName(message.sender, message.sender.role))}
                    </Avatar>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: message.status === 'unread' && message.recipient.id === user?.id ? 'bold' : 'regular'
                            }}
                          >
                            {message.subject}
                          </Typography>
                          {getStatusChip(message.status)}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {message.sender.id === user?.id 
                              ? `To: ${formatUserName(message.recipient, message.recipient.role)}` 
                              : `From: ${formatUserName(message.sender, message.sender.role)}`}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {new Date(message.created_at).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default MessageList;