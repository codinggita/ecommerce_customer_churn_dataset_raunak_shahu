import { createTheme } from '@mui/material/styles';

const baseThemeOptions = {
  typography: {
    fontFamily: '"Inter", "Outfit", "system-ui", "-apple-system", sans-serif',
    h1: {
      fontWeight: 900,
      letterSpacing: '-0.03em',
    },
    h2: {
      fontWeight: 800,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 700,
    },
    subtitle1: {
      fontWeight: 600,
    },
    subtitle2: {
      fontWeight: 600,
    },
    body1: {
      letterSpacing: '-0.01em',
    },
    body2: {
      letterSpacing: '-0.01em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
  },
  shape: {
    borderRadius: 16,
  },
};

export const lightTheme = createTheme({
  ...baseThemeOptions,
  palette: {
    mode: 'light',
    primary: {
      main: '#c9a84c', // LexIndia Gold
      light: '#dfbe63',
      dark: '#ae8c33',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7c4dff', // Purple Accent
      light: '#9e7cff',
      dark: '#582ecc',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f6f8fa', // Off-white
      paper: '#ffffff',
    },
    text: {
      primary: '#0e1113', // Deep gray
      secondary: '#4f5e6b', // Muted slate
    },
    divider: '#e3e7eb',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 20px',
          boxShadow: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(201, 168, 76, 0.15)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0) scale(0.98)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02), 0 8px 24px rgba(142, 147, 154, 0.08)',
          border: '1px solid #e9ecf0',
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  ...baseThemeOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: '#e6c364', // Brighter Gold for Dark Mode
      light: '#edd48a',
      dark: '#c9a84c',
      contrastText: '#0f1011',
    },
    secondary: {
      main: '#a78bfa', // Lavender
      light: '#c084fc',
      dark: '#7c4dff',
      contrastText: '#0f1011',
    },
    background: {
      default: '#0c0d0e', // Pure Deep Charcoal
      paper: '#131517', // Elevate dark paper
    },
    text: {
      primary: '#f1f3f5',
      secondary: '#919da9',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 20px',
          boxShadow: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(230, 195, 100, 0.15)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0) scale(0.98)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});
