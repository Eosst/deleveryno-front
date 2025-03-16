// src/components/messaging/ComposeMessage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { createMessage, getMessage } from '../../api/messages';
import { getUsers } from '../../api/users';
import { useAuth } from '../../contexts/AuthContext';

const ComposeMessage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState(null);
  
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    recipient_id: ''
  });

  const isAdmin = user?.role === 'admin';

  // Check for reply parameter in URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const replyId = queryParams.get('reply');
    
    if (replyId) {
      fetchReplyMessage(replyId);
    }
    
    // Only fetch users for admin users (sellers and drivers don't need to choose a recipient)
    if (isAdmin) {
      fetchAvailableUsers();
    }
  }, [location, isAdmin]);

  const fetchReplyMessage = async (replyId) => {
    try {
      const messageData = await getMessage(replyId);
      setReplyToMessage(messageData);
      
      // Pre-fill form for reply
      setFormData({
        subject: `Re: ${messageData.subject}`,
        content: '',
        recipient_id: messageData.sender.id
      });
    } catch (err) {
      console.error('Error fetching reply message:', err);
    }
  };

  const fetchAvailableUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await getUsers();
      // Filter out current user and get only non-admin users if current user is admin
      const filteredUsers = (response.results || []).filter(u => {
        // For admin, show all non-admin users
        if (isAdmin) {
          return u.id !== user.id && u.role !== 'admin';
        }
        return false;
      });
      setUsers(filteredUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.content.trim()) {
      setError('Subject and message content are required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // For non-admin users, we don't need to send recipient_id
      // The backend will handle it automatically
      const dataToSend = isAdmin ? formData : {
        subject: formData.subject,
        content: formData.content
      };
      
      await createMessage(dataToSend);
      navigate('/messages');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ mb: 3 }}>
        Back to Messages
      </Button>

      <Typography variant="h4" gutterBottom>
        {replyToMessage ? 'Reply to Message' : 'New Message'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          {/* Only show recipient selection for admin users */}
          {isAdmin && (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Recipient</InputLabel>
              <Select
                name="recipient_id"
                value={formData.recipient_id}
                onChange={handleChange}
                label="Recipient"
                required
                disabled={usersLoading || replyToMessage}
              >
                {usersLoading ? (
                  <MenuItem disabled>Loading users...</MenuItem>
                ) : users.length === 0 ? (
                  <MenuItem disabled>No users available</MenuItem>
                ) : (
                  users.map(u => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.first_name && u.last_name 
                        ? `${u.first_name} ${u.last_name}` 
                        : u.username} ({u.role})
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          )}

          {/* For non-admin users, show who they're messaging */}
          {!isAdmin && !replyToMessage && (
            <Alert severity="info" sx={{ mb: 3 }}>
              You are sending a message to the Administration team.
            </Alert>
          )}

          <TextField
            fullWidth
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Message"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            multiline
            rows={6}
            sx={{ mb: 3 }}
          />

          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Send Message'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default ComposeMessage;