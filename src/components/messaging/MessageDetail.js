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
  Alert,
  Avatar,
  useMediaQuery,
  useTheme,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { 
  ArrowBack as BackIcon, 
  Reply as ReplyIcon, 
  Archive as ArchiveIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { getMessage, updateMessage } from '../../api/messages';
import { useAuth } from '../../contexts/AuthContext';

const MessageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [archiveLoading, setArchiveLoading] = useState(false);

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
      if (messageData.status === 'unread' && messageData.recipient.id === user?.id) {
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
    if (!messageUser) return "Unknown";
    
    // If the user is not an admin and the message user is an admin, show as "Administration"
    if (!isAdmin && userRole === 'admin') {
      return "Administration";
    }
    
    // Otherwise show the actual user name
    return messageUser.first_name && messageUser.last_name
      ? `${messageUser.first_name} ${messageUser.last_name}`
      : messageUser.username || "Unknown";
  };
  
  // Get initials for avatar
  const getInitials = (name) => {
    if (!name || name === "Administration") return "A";
    if (name === "Unknown") return "?";
    
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

  const handleArchiveClick = () => {
    setConfirmDialogOpen(true);
  };

  const handleArchive = async () => {
    setArchiveLoading(true);
    try {
      await updateMessage(message.id, { status: 'archived' });
      navigate('/messages');
    } catch (err) {
      console.error('Error archiving message:', err);
      setError('Failed to archive message. Please try again.');
    } finally {
      setArchiveLoading(false);
      setConfirmDialogOpen(false);
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
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Button 
        startIcon={<BackIcon />} 
        onClick={() => navigate(-1)} 
        sx={{ mb: 3 }}
        variant={isMobile ? "outlined" : "text"}
        fullWidth={isMobile}
      >
        Back to Messages
      </Button>

      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{ 
            p: 3, 
            bgcolor: 'primary.main', 
            color: 'white'
          }}
        >
          <Typography variant="h5">
            {message.subject}
          </Typography>
        </Box>
        
        <Box sx={{ p: 3 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between', 
              mb: 3
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                mb: isMobile ? 2 : 0
              }}
            >
              <Avatar 
                sx={{ 
                  bgcolor: getAvatarColor(message.sender?.role || 'unknown'),
                  mr: 2
                }}
              >
                {getInitials(formatUserName(message.sender, message.sender?.role))}
              </Avatar>
              <Box>
                <Typography variant="subtitle1">
                  From: {formatUserName(message.sender, message.sender?.role)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {message.sender?.role ? (message.sender.role.charAt(0).toUpperCase() + message.sender.role.slice(1)) : 'Unknown'}
                </Typography>
              </Box>
            </Box>
            
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center'
              }}
            >
              <Avatar 
                sx={{ 
                  bgcolor: getAvatarColor(message.recipient?.role || 'unknown'),
                  mr: 2
                }}
              >
                {getInitials(formatUserName(message.recipient, message.recipient?.role))}
              </Avatar>
              <Box>
                <Typography variant="subtitle1">
                  To: {formatUserName(message.recipient, message.recipient?.role)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {message.recipient?.role ? (message.recipient.role.charAt(0).toUpperCase() + message.recipient.role.slice(1)) : 'Unknown'}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              mb: 3
            }}
          >
            <TimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="textSecondary">
              {new Date(message.created_at).toLocaleString()}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography 
            variant="body1" 
            sx={{ 
              whiteSpace: 'pre-wrap',
              mb: 4,
              lineHeight: 1.6
            }}
          >
            {message.content}
          </Typography>
          
          <Box 
            sx={{ 
              mt: 3, 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              gap: 2
            }}
          >
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to={`/messages/new?reply=${message.id}`}
              startIcon={<ReplyIcon />}
              fullWidth={isMobile}
            >
              Reply
            </Button>
            
            {message.recipient?.id === user?.id && message.status !== 'archived' && (
              <Button 
                variant="outlined" 
                color="secondary"
                onClick={handleArchiveClick}
                startIcon={<ArchiveIcon />}
                fullWidth={isMobile}
              >
                Archive
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Archive Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Archive Message?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to archive this message? This will move it out of your main inbox.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleArchive} 
            color="primary"
            disabled={archiveLoading}
          >
            {archiveLoading ? <CircularProgress size={24} /> : "Archive"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MessageDetail;