// src/components/messaging/MessageDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { ArrowBack as BackIcon, Reply as ReplyIcon } from '@mui/icons-material';
import { getMessage, updateMessage } from '../../api/messages';
import { useAuth } from '../../contexts/AuthContext';

const MessageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchMessage();
  }, [id]);

  const fetchMessage = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const messageData = await getMessage(id);
      setMessage(messageData);
      
      // If message is unread and user is recipient, mark as read
      if (messageData.status === 'unread' && messageData.recipient.id === user.id) {
        await updateMessage(id, { status: 'read' });
      }
    } catch (err) {
      console.error('Error fetching message:', err);
      setError('Failed to load message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format user name based on role
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
    return (
      <Box>
        <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Back
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!message) {
    return (
      <Box>
        <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Back
        </Button>
        <Alert severity="warning">Message not found</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ mb: 3 }}>
        Back to Messages
      </Button>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {message.subject}
        </Typography>
        
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography variant="body2" color="textSecondary">
            From: {formatUserName(message.sender, message.sender.role)}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            To: {formatUserName(message.recipient, message.recipient.role)}
          </Typography>
        </Box>
        
        <Typography variant="body2" color="textSecondary" mb={2}>
          {new Date(message.created_at).toLocaleString()}
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {message.content}
        </Typography>
        
        <Box mt={3} display="flex" justifyContent="space-between">
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to={`/messages/new?reply=${message.id}`}
            startIcon={<ReplyIcon />}
          >
            Reply
          </Button>
          
          {message.recipient.id === user.id && message.status !== 'archived' && (
            <Button 
              variant="outlined" 
              color="secondary"
              onClick={async () => {
                try {
                  await updateMessage(message.id, { status: 'archived' });
                  navigate('/messages');
                } catch (err) {
                  console.error('Error archiving message:', err);
                }
              }}
            >
              Archive
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default MessageDetail;