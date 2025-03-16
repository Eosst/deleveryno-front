// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            paddingLeft: '10px',
            paddingRight: '10px',
            fontSize: '0.8rem',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            padding: '8px',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          '@media (max-width:600px)': {
            margin: '10px',
            width: 'calc(100% - 20px)',
            maxHeight: 'calc(100% - 20px)',
          },
        },
      },
    },
  },
  typography: {
    h4: {
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h5: {
      '@media (max-width:600px)': {
        fontSize: '1.25rem',
      },
    },
    h6: {
      '@media (max-width:600px)': {
        fontSize: '1.1rem',
      },
    },
  },
});

export default theme;