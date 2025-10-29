// src/pages/auth/LoginPage.js - Mobile-optimized version
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Grid,
  CircularProgress,
  useMediaQuery,
  useTheme,
  InputAdornment,
  IconButton
} from '@mui/material';
import { 
  LockOutlined,
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation();

  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Clear errors when the component mounts
  useEffect(() => {
    setError('');
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
    });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form submission
    
    if (loading) return; // Prevent multiple submissions
    
    // Validate form
    if (!credentials.email || !credentials.password) {
      setError(t('auth.login.requiredError'));
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const data = await login(credentials);
      
      // Redirect based on user role
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (data.user.role === 'seller') {
        navigate('/seller/dashboard');
      } else if (data.user.role === 'driver') {
        navigate('/driver/dashboard');
      }
    } catch (err) {
      // Error is already set in the AuthContext, no need to set it here
      console.error('Login error handled in AuthContext');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: isMobile ? 4 : 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 4
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            padding: isMobile ? 3 : 4, 
            width: '100%',
            borderRadius: 2
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3
            }}
          >
            <LockOutlined sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography 
              component="h1" 
              variant={isMobile ? "h5" : "h4"}
              sx={{ fontWeight: 'bold' }}
            >
              {t('auth.login.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t('auth.login.subtitle')}
            </Typography>
          </Box>

          {(error || authError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error || authError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label={t('auth.common.emailAddress')}
              name="email"
              autoComplete="email"
              autoFocus
              value={credentials.email}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 1 }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label={t('auth.common.password')}
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={t('auth.login.togglePassword')}
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { borderRadius: 1 }
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2,
                py: 1.5,
                borderRadius: 1,
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : t('auth.login.signIn')}
            </Button>

            <Typography 
              variant="body2" 
              align="center" 
              sx={{ mt: 2, color: 'primary.main' }}
            >
              <Link to="/password-reset" style={{ textDecoration: 'none', color: 'inherit' }}>
                {t('auth.login.forgotPassword')}
              </Link>
            </Typography>

            <Box sx={{ mt: 4, mb: 1 }}>
              <Typography variant="body2" align="center" color="text.secondary">
                {t('auth.login.registerPrompt')}
              </Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button
                  component={Link}
                  to="/register/seller"
                  variant="outlined"
                  fullWidth
                  sx={{ borderRadius: 1 }}
                >
                  {t('auth.common.seller')}
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  component={Link}
                  to="/register/driver"
                  variant="outlined"
                  fullWidth
                  sx={{ borderRadius: 1 }}
                >
                  {t('auth.common.driver')}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;