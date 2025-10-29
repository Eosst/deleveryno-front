// src/components/common/NotFound.js
import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const { t } = useTranslation();
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ backgroundColor: '#f5f5f5' }}
    >
      <Paper elevation={3} sx={{ p: 5, maxWidth: 500, textAlign: 'center' }}>
        <Typography variant="h1" color="primary" gutterBottom>
          404
        </Typography>
        <Typography variant="h5" gutterBottom>
          {t('notFound.title')}
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          {t('notFound.description')}
        </Typography>
        <Button 
          component={Link} 
          to="/" 
          variant="contained" 
          color="primary"
          sx={{ mt: 2 }}
        >
          {t('notFound.backToHome')}
        </Button>
      </Paper>
    </Box>
  );
};

export default NotFound;