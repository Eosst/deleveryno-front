// src/pages/auth/LoginPage.js - Improved version
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
  CircularProgress
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';

const LoginPage = () => {
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form submission
    
    if (loading) return; // Prevent multiple submissions
    
    // Validate form
    if (!credentials.email || !credentials.password) {
      setError('Email and password are required');
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
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3
            }}
          >
            <LockOutlined sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography component="h1" variant="h5">
              DeliveryNo - Login
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Enter your credentials to access the platform
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
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={credentials.email}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={handleChange}
              disabled={loading}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>

            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              <Link to="/password-reset" style={{ textDecoration: 'none', color: 'primary.main' }}>
                Forgot password?
              </Link>
            </Typography>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <Typography variant="body2" align="center" color="text.secondary">
                  Don't have an account? Register as:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Button
                  component={Link}
                  to="/register/seller"
                  variant="outlined"
                  fullWidth
                >
                  Seller
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  component={Link}
                  to="/register/driver"
                  variant="outlined"
                  fullWidth
                >
                  Driver
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