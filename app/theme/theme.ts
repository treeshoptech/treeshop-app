'use client';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#007AFF', // Apple Blue
      light: '#0A84FF',
      dark: '#0051D5',
    },
    secondary: {
      main: '#8E8E93', // iOS gray
      light: '#AEAEB2',
      dark: '#636366',
    },
    background: {
      default: '#000000', // Pure black
      paper: '#1C1C1E', // Dark gray for cards
    },
    text: {
      primary: '#FFFFFF', // White for headings
      secondary: '#8E8E93', // iOS gray for secondary text
    },
    divider: '#2C2C2E', // Subtle borders
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      color: '#FFFFFF',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
      color: '#FFFFFF',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.4,
      color: '#FFFFFF',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      color: '#FFFFFF',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.5,
      color: '#FFFFFF',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
      color: '#FFFFFF',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      color: '#FFFFFF',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#8E8E93',
    },
  },
  shape: {
    borderRadius: 12, // Rounded corners like iOS
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1C1C1E',
          borderRadius: 12,
          border: '1px solid #2C2C2E',
          transition: 'border-color 0.2s ease',
          '&:hover': {
            borderColor: '#007AFF',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 10,
          fontWeight: 600,
          padding: '10px 20px',
        },
        contained: {
          backgroundColor: '#007AFF',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#0051D5',
          },
        },
        outlined: {
          borderColor: '#007AFF',
          color: '#007AFF',
          '&:hover': {
            borderColor: '#0A84FF',
            backgroundColor: 'rgba(0, 122, 255, 0.1)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000',
          borderBottom: '1px solid #2C2C2E',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1C1C1E',
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default theme;
