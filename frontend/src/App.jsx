import React, { useState } from 'react';
import { ThemeProvider, CssBaseline, Box, Container, Typography, Card, CardContent, Button, IconButton, Grid, Chip } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import CodeIcon from '@mui/icons-material/Code';
import CheckIcon from '@mui/icons-material/Check';
import { lightTheme, darkTheme } from './theme';

function App() {
  const [mode, setMode] = useState('dark');

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const activeTheme = mode === 'light' ? lightTheme : darkTheme;

  const installedPackages = [
    { name: '@mui/material', type: 'Core UI', version: 'v9' },
    { name: '@tailwindcss/vite', type: 'Styling', version: 'v4' },
    { name: 'recharts', type: 'Charts', version: 'v3' },
    { name: 'react-router-dom', type: 'Routing', version: 'v7' },
    { name: '@reduxjs/toolkit', type: 'State Management', version: 'v2' },
    { name: 'axios', type: 'API Client', version: 'v1' },
    { name: 'formik & yup', type: 'Form Validation', version: 'v2/v1' },
  ];

  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      <Box 
        className="min-height-screen transition-all duration-300"
        sx={{ 
          minHeight: '100vh',
          background: mode === 'light' 
            ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' 
            : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          py: 6 
        }}
      >
        <Container maxWidth="lg">
          {/* Header */}
          <Box className="flex justify-between items-center mb-10 pb-6 border-b" sx={{ borderColor: 'divider' }}>
            <Box>
              <Typography variant="h4" className="font-extrabold tracking-tight flex items-center gap-2">
                <CodeIcon color="primary" sx={{ fontSize: 32 }} />
                <span>Analytics System Dashboard</span>
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mt-1">
                Phase 1: Installation & Design System Core
              </Typography>
            </Box>

            <Box className="flex items-center gap-3">
              <Chip 
                label={`PR 1 / 10`} 
                color="primary" 
                variant="outlined" 
                className="font-semibold" 
              />
              <IconButton onClick={toggleTheme} color="primary" sx={{ border: '1px solid', borderColor: 'divider' }}>
                {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>
            </Box>
          </Box>

          {/* Main Visual Content */}
          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
              <Card 
                sx={{ 
                  background: mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.7)',
                  backdropFilter: 'blur(12px)',
                  p: 2 
                }}
              >
                <CardContent>
                  <Typography variant="h5" gutterBottom className="font-bold mb-4">
                    Environment Status
                  </Typography>
                  <Typography variant="body1" paragraph color="text.secondary">
                    All core dependencies for the React frontend have been successfully installed and configured. This frontend is connected to a local Express/Node server proxied on port <code>5173</code> to direct backend queries to <code>5000</code>.
                  </Typography>

                  <Box className="flex gap-4 mt-6">
                    <Button variant="contained" color="primary" startIcon={<CheckIcon />}>
                      Setup Complete
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={toggleTheme}>
                      Switch to {mode === 'light' ? 'Dark' : 'Light'} Mode
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={5}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom className="font-bold mb-4">
                    Installed Core Dependencies
                  </Typography>
                  <Box className="flex flex-col gap-3">
                    {installedPackages.map((pkg, idx) => (
                      <Box 
                        key={idx} 
                        className="flex justify-between items-center p-3 rounded-lg border"
                        sx={{ 
                          borderColor: 'divider',
                          backgroundColor: mode === 'light' ? 'rgba(0,0,0,0.01)' : 'rgba(255,255,255,0.02)' 
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle2" className="font-semibold">
                            {pkg.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {pkg.type}
                          </Typography>
                        </Box>
                        <Chip label={pkg.version} size="small" color="secondary" variant="outlined" />
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
