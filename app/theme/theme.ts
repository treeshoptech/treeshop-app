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
      fontSize: '1.75rem', // Mobile-optimized (was 2.5rem)
      lineHeight: 1.2,
      color: '#FFFFFF',
    },
    h2: {
      fontWeight: 600,
      fontSize: '1.5rem', // Mobile-optimized (was 2rem)
      lineHeight: 1.3,
      color: '#FFFFFF',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.25rem', // Mobile-optimized (was 1.75rem)
      lineHeight: 1.4,
      color: '#FFFFFF',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.125rem', // Mobile-optimized (was 1.5rem)
      lineHeight: 1.4,
      color: '#FFFFFF',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1rem', // Mobile-optimized (was 1.25rem)
      lineHeight: 1.5,
      color: '#FFFFFF',
    },
    h6: {
      fontWeight: 600,
      fontSize: '0.875rem', // Mobile-optimized (was 1rem)
      lineHeight: 1.5,
      color: '#FFFFFF',
    },
    body1: {
      fontSize: '0.9375rem', // Mobile-optimized (was 1rem)
      lineHeight: 1.6,
      color: '#FFFFFF',
    },
    body2: {
      fontSize: '0.8125rem', // Mobile-optimized (was 0.875rem)
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
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '12px', // Tighter mobile padding (was 16px default)
          '&:last-child': {
            paddingBottom: '12px',
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
          padding: '12px 24px', // Larger touch targets (was 10px 20px)
          minHeight: '44px', // iOS minimum touch target
          fontSize: '0.9375rem',
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
        sizeSmall: {
          padding: '8px 16px',
          minHeight: '36px',
          fontSize: '0.8125rem',
        },
        sizeLarge: {
          padding: '14px 28px',
          minHeight: '48px',
          fontSize: '1rem',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: '12px', // Larger touch target
          minWidth: '44px',
          minHeight: '44px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            minHeight: '48px', // Larger touch target for inputs
            fontSize: '1rem', // Prevent iOS zoom on focus
          },
          '& .MuiInputBase-input': {
            padding: '12px 14px',
            fontSize: '1rem', // Prevent iOS zoom
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          minHeight: '48px', // Larger touch target
          padding: '12px 14px',
          fontSize: '1rem', // Prevent iOS zoom
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          height: '28px',
          fontSize: '0.75rem',
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
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '12px', // Tighter mobile margins
          paddingRight: '12px',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '8px', // Tighter mobile table cells (was 16px)
          fontSize: '0.875rem',
        },
        head: {
          fontWeight: 600,
          fontSize: '0.8125rem',
        },
      },
    },
  },
});

export default theme;
