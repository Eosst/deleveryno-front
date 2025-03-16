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
  Alert
} from '@mui/material';
import { Link } from 'react-router-dom';
import { getMessages } from '../../api/messages';
import { useAuth } from '../../contexts/AuthContext';
import { Add as AddIcon } from '@mui/icons-material';

const MessageList = () => {
  const { user } = useAuth();
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
      console.log('Fetching messages...');
      const response = await getMessages();
      console.log('Messages response:', response);
      setMessages(response.results || response);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'unread':
        return <Chip label="Unread" color="error" size="small" />;
      case 'read':
        return <Chip label="Read" color="primary" size="small" />;
      case 'archived':
        return <Chip label="Archived" color="default" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  // Format sender/recipient name
  const formatUserName = (messageUser, userRole) => {
    // If the user is not an admin and the message user is an admin, show as "Administration"
    if (!isAdmin && userRole === 'admin') {
      return "Administration";
    }
    
    // Otherwise show the actual user name
    return messageUser.first_name && messageUser.last_name
      ? `${messageUser.first_name} ${messageUser.last_name}`
      : messageUser.username;
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Messages</Typography>
        <Button
          component={Link}
          to="/messages/new"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
        >
          New Message
        </Button>
      </Box>

      <Paper>
        {messages.length === 0 ? (
          <Box p={3} textAlign="center">
            <Typography variant="body1" color="textSecondary">
              No messages found
            </Typography>
          </Box>
        ) : (
          <List>
            {messages.map((message) => (
              <React.Fragment key={message.id}>
                <ListItem
                  button
                  component={Link}
                  to={`/messages/${message.id}`}
                  sx={{
                    bgcolor: message.status === 'unread' && message.recipient.id === user.id ? 'action.hover' : 'inherit',
                    fontWeight: message.status === 'unread' && message.recipient.id === user.id ? 'bold' : 'normal',
                  }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: message.status === 'unread' && message.recipient.id === user.id ? 'bold' : 'regular'
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
                          {message.sender.id === user.id 
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
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default MessageList;