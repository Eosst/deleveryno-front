import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Grid, 
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  InputAdornment
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationCity as CityIcon,
  AccountBalance as RibIcon,
  Badge as UsernameIcon,
  Business as RoleIcon
} from '@mui/icons-material';

const Profile = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation();
  
  const { user, updateProfile, error: authError, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    city: '',
    rib: ''
  });

  useEffect(() => {
    // Redirect to login if no user is found after loading completes
    if (!user && !authLoading) {
      navigate('/login');
      return;
    }

    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || '',
        rib: user.rib || ''
      });
    }
  }, [user, authLoading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProfileError('');
    setSuccess(false);
    
    try {
      await updateProfile(formData);
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const errMsg = err.response?.data || {};
      // Format error messages
      const errors = Object.keys(errMsg).map(key => `${key}: ${errMsg[key]}`);
      setProfileError(errors.join(', ') || 'Profile update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* User info card */}
      <Card elevation={3} sx={{ mb: 3, borderRadius: 2, overflow: 'visible' }}>
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'center' : 'flex-start',
            justifyContent: 'space-between',
            mb: 2
          }}>
            <Box sx={{ textAlign: isMobile ? 'center' : 'left' }}>
              <Typography variant="h4" gutterBottom>
                {user.first_name} {user.last_name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: isMobile ? 'center' : 'flex-start' }}>
                <UsernameIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                  {t('profile.username')}: {user.username}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                <RoleIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {t('profile.role')}: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          {/* Status alerts */}
          {profileError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {profileError}
            </Alert>
          )}
          
          {authError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {authError}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {t('profile.updateSuccess')}
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {/* Edit Profile form */}
      <Paper elevation={3} sx={{ p: isMobile ? 2 : 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          {t('profile.editProfile')}
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('profile.firstName')}
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('profile.lastName')}
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('profile.email')}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('profile.phone')}
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('profile.city')}
                name="city"
                value={formData.city}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CityIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {/* Only show RIB field for sellers */}
            {user.role === 'seller' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('profile.rib')}
                  name="rib"
                  value={formData.rib || ''}
                  onChange={handleChange}
                  helperText={t('profile.ribHelper')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <RibIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            )}
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: isMobile ? 'center' : 'flex-start' }}>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
              sx={{ minWidth: isMobile ? '100%' : '200px' }}
            >
              {loading ? <CircularProgress size={24} /> : t('profile.updateButton')}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Profile;