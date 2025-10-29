// Focused fix for the message textarea in ComposeMessage.js
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
  Alert,
  Divider,
  useMediaQuery,
  useTheme,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextareaAutosize
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Send as SendIcon,
  Person as PersonIcon,
  Subject as SubjectIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { createMessage, getMessage } from '../../api/messages';
import { getUsers } from '../../api/users';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const ComposeMessage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation();
  
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');
  
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
    
    // Only fetch users for admin users
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
        recipient_id: messageData.sender?.id || ''
      });
    } catch (err) {
      console.error('Error fetching reply message:', err);
      setError(t('messages.compose.errors.failedLoadReply'));
    }
  };

  const fetchAvailableUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await getUsers();
      // Filter out current user and get only non-admin users if current user is admin
      const filteredUsers = (response.results || []).filter(u => {
        if (isAdmin) {
          return u.id !== user?.id && u.role !== 'admin';
        }
        return false;
      });
      setUsers(filteredUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(t('messages.compose.errors.failedLoadUsers'));
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
      setError(t('messages.compose.errors.required'));
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // For non-admin users, we don't need to send recipient_id
      const dataToSend = isAdmin ? formData : {
        subject: formData.subject,
        content: formData.content
      };
      
      await createMessage(dataToSend);
      navigate('/messages');
    } catch (err) {
      console.error('Error sending message:', err);
      
      if (err.response && err.response.data) {
        const errorDetails = JSON.stringify(err.response.data, null, 2);
        setErrorDetails(errorDetails);
        setShowErrorDialog(true);
      }
      
      setError(t('messages.compose.errors.failedSend'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Button 
        startIcon={<BackIcon />} 
        onClick={() => navigate(-1)} 
        sx={{ mb: 3 }}
        variant={isMobile ? "outlined" : "text"}
        fullWidth={isMobile}
      >
        {t('messages.common.backToMessages')}
      </Button>

      <Typography variant="h4" gutterBottom align={isMobile ? "center" : "left"}>
        {replyToMessage ? t('messages.compose.replyTitle') : t('messages.compose.newTitle')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: isMobile ? 2 : 3, borderRadius: 2 }}>
        <form onSubmit={handleSubmit}>
          {/* Only show recipient selection for admin users */}
          {isAdmin && (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>{t('messages.compose.recipient')}</InputLabel>
              <Select
                name="recipient_id"
                value={formData.recipient_id}
                onChange={handleChange}
                label={t('messages.compose.recipient')}
                required
                disabled={usersLoading || replyToMessage}
              >
                {usersLoading ? (
                  <MenuItem disabled>{t('messages.compose.loadingUsers')}</MenuItem>
                ) : users.length === 0 ? (
                  <MenuItem disabled>{t('messages.compose.noUsers')}</MenuItem>
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
              {t('messages.compose.info.toAdmin')}
            </Alert>
          )}

          {/* Show who we're replying to */}
          {replyToMessage && (
            <Alert severity="info" sx={{ mb: 3 }}>
              {t('messages.compose.info.replyingTo')}: {replyToMessage.sender?.role === 'admin' 
                ? t('messages.common.administration') 
                : `${replyToMessage.sender?.first_name || ''} ${replyToMessage.sender?.last_name || ''} (${replyToMessage.sender?.role || t('messages.common.unknown')})`}
            </Alert>
          )}

          <TextField
            fullWidth
            label={t('messages.compose.subject')}
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
          />

          {/* COMPLETELY REDESIGNED MESSAGE INPUT AREA */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ mb: 1 }}>
              {t('messages.compose.messageLabel')}
            </Typography>
            <textarea 
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              placeholder={t('messages.compose.messagePlaceholder')}
              style={{ 
                width: '100%',
                minHeight: isMobile ? '250px' : '200px',
                padding: '12px',
                fontFamily: 'inherit',
                fontSize: '1rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                resize: 'vertical'
              }}
            />
          </Box>

          <Box 
            display="flex" 
            justifyContent={isMobile ? "center" : "flex-end"}
          >
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={24} /> : <SendIcon />}
              size={isMobile ? "large" : "medium"}
              sx={{ minWidth: isMobile ? '100%' : '120px' }}
            >
              {t('messages.compose.send')}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Error Details Dialog */}
      <Dialog 
        open={showErrorDialog} 
        onClose={() => setShowErrorDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t('messages.compose.errorDetails')}</DialogTitle>
        <DialogContent>
          <DialogContentText component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
            {errorDetails}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowErrorDialog(false)}>{t('common.close') || 'Close'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComposeMessage;