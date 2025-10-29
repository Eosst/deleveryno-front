// src/App.js
import React, { useMemo } from 'react';
import AppRoutes from './routes';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Snackbar, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { WifiOff as OfflineIcon } from '@mui/icons-material';
import theme from './theme';
import useNetworkStatus from './hooks/useNetworkStatus';
import './App.css';
import './mobile.css'; // Import mobile-specific CSS
import LanguageSwitcher from './components/LanguageSwitcher';


function App() {
  const { isOnline } = useNetworkStatus();
  const { t } = useTranslation();
  
  // Use useMemo to prevent unnecessary re-renders
  const appContent = useMemo(() => (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppRoutes />
        
        {/* Offline notification - only show when offline */}
        <Snackbar
          open={!isOnline}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            severity="warning" 
            icon={<OfflineIcon />}
            sx={{ width: '100%' }}
            className="offline-notification"
          >
            {t('common.offlineNotice')}
          </Alert>
        </Snackbar>
      </AuthProvider>
    </ThemeProvider>
  ), [isOnline]); // Only re-render when online status changes
  
  return appContent;
}

export default App;