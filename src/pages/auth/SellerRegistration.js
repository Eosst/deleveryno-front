// src/pages/auth/SellerRegistration.js - Fixed for mobile view
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerSeller } from '../../api/auth';
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
  InputAdornment,
  IconButton,
  useMediaQuery,
  useTheme,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  Store as StoreIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationCity as CityIcon,
  Lock as LockIcon,
  AccountBalance as RibIcon,
  Visibility,
  VisibilityOff,
  ArrowBack,
  ArrowForward
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const SellerRegistration = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    city: '',
    rib: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const validateStep = (step) => {
    switch (step) {
      case 0: // Account info
        return formData.email && formData.password && formData.password.length >= 8;
      case 1: // Personal info
        return formData.first_name && formData.last_name;
      case 2: // Contact info
        return formData.phone && formData.city;
      default:
        return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await registerSeller(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error("Registration error:", err);
      if (err.response && err.response.data) {
        // Format error messages from API response
        const errorMessages = [];
        Object.keys(err.response.data).forEach(key => {
          const messages = err.response.data[key];
          if (Array.isArray(messages)) {
            errorMessages.push(`${key}: ${messages.join(', ')}`);
          } else {
            errorMessages.push(`${key}: ${messages}`);
          }
        });
        setError(errorMessages.join('\n'));
      } else {
        setError(t('auth.register.failed'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container component="main" maxWidth="sm">
        <Box sx={{ mt: isMobile ? 4 : 8 }}>
          <Alert severity="success">
            <Typography variant="h6">{t('auth.register.successTitle')}</Typography>
            <Typography>
              {t('auth.register.successMessage')}
            </Typography>
          </Alert>
        </Box>
      </Container>
    );
  }

  // Steps content
  const steps = [
    {
      label: t('auth.register.steps.accountInfo'),
      content: (
        <>
          <TextField
            margin="normal"
            required
            fullWidth
            label={t('auth.common.emailAddress')}
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
          <TextField
            margin="normal"
            required
            fullWidth
            label={t('auth.common.password')}
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            helperText={t('auth.register.passwordHint')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
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
            }}
          />
        </>
      )
    },
    {
      label: t('auth.register.steps.personalInfo'),
      content: (
        <>
          <TextField
            margin="normal"
            required
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
          <TextField
            margin="normal"
            required
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
        </>
      )
    },
    {
      label: t('auth.register.steps.contactDetails'),
      content: (
        <>
          <TextField
            margin="normal"
            required
            fullWidth
            label={t('auth.common.phoneNumber')}
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
          <TextField
            margin="normal"
            required
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
        </>
      )
    },
    {
      label: t('auth.register.steps.paymentInfo'),
      content: (
        <>
          <TextField
            margin="normal"
            fullWidth
            label={t('profile.rib')}
            name="rib"
            value={formData.rib}
            onChange={handleChange}
            placeholder={t('auth.register.ribPlaceholder')}
            helperText={t('profile.ribHelper')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <RibIcon />
                </InputAdornment>
              ),
            }}
          />
        </>
      )
    }
  ];

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: isMobile ? 2 : 4,
          marginBottom: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: isMobile ? 2 : 4, width: '100%', borderRadius: 2 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3
            }}
          >
            <StoreIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography component="h1" variant={isMobile ? "h5" : "h4"} align="center">
              {t('auth.register.sellerTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t('auth.register.sellerSubtitle')}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {isMobile ? (
            // Mobile stepper - FIXED with proper styles and structure
            <Box sx={{ width: '100%' }}>
              <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel>{step.label}</StepLabel>
                    <StepContent>
                      <Box sx={{ py: 1, width: '100%' }}>
                        {step.content}
                      </Box>
                      <Box sx={{ mt: 2, mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                        <Button
                          disabled={index === 0}
                          onClick={handleBack}
                          startIcon={<ArrowBack />}
                          variant="outlined"
                          size="small"
                        >
                          {t('common.back')}
                        </Button>
                        {index === steps.length - 1 ? (
                          <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={loading || !validateStep(index)}
                            size="small"
                          >
                            {loading ? <CircularProgress size={24} /> : t('auth.register.register')}
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            onClick={handleNext}
                            disabled={!validateStep(index)}
                            endIcon={<ArrowForward />}
                            size="small"
                          >
                            {t('common.next')}
                          </Button>
                        )}
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </Box>
          ) : (
            // Desktop form
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
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
                    required
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
                    required
                    fullWidth
                    label={t('auth.common.emailAddress')}
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
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label={t('auth.common.password')}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon />
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
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label={t('auth.common.phoneNumber')}
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
                    required
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
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('profile.rib')}
                    name="rib"
                    value={formData.rib}
                    onChange={handleChange}
                    placeholder={t('auth.register.ribPlaceholder')}
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
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : t('auth.register.register')}
              </Button>
            </Box>
          )}

          <Grid container justifyContent="center" sx={{ mt: 2 }}>
            <Grid item>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  {t('auth.register.alreadyHaveAccount')}
                </Typography>
              </Link>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default SellerRegistration;