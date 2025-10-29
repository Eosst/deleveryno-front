// src/pages/auth/PasswordResetRequest.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { requestPasswordReset } from '../../api/auth';
import { useTranslation } from 'react-i18next';

const PasswordResetRequest = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError(t('auth.common.emailRequired'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      await requestPasswordReset(email);
      setSuccess(true);
    } catch (err) {
      console.error('Error requesting password reset:', err);
      setError(t('auth.reset.failed'));
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
              {t('auth.reset.title')}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success ? (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                {t('auth.reset.success')}
              </Alert>
              <Button
                component={Link}
                to="/login"
                fullWidth
                variant="contained"
              >
                {t('auth.reset.returnToLogin')}
              </Button>
            </Box>
          ) : (
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
                value={email}
                onChange={handleChange}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : t('auth.reset.sendLink')}
              </Button>
              <Box textAlign="center">
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="primary">
                    {t('auth.reset.backToLogin')}
                  </Typography>
                </Link>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default PasswordResetRequest;