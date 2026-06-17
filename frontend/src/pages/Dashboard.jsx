import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Button, Box, Grid, Alert, Chip, IconButton } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import ShieldIcon from '@mui/icons-material/Shield';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useThemeMode } from '../App';
import { useSelector, useDispatch } from 'react-redux';
import { clearCredentials } from '../store/slices';

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mode, toggleTheme } = useThemeMode();
  
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(clearCredentials());
    navigate('/login');
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
        transition: 'all 0.3s ease',
        py: 10,
        px: 6
      }}
    >
      <Box className="max-w-5xl mx-auto">
        {/* Header */}
        <Box 
          className="flex justify-between items-center mb-8 pb-6 border-b" 
          sx={{ borderColor: 'divider' }}
        >
          <Box className="flex items-center gap-3">
            <DashboardIcon color="primary" sx={{ fontSize: 36 }} />
            <Box>
              <Typography variant="h4" className="font-extrabold tracking-tight">
                Customer Analytics Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Logged in as: <strong style={{ color: mode === 'light' ? '#0f172a' : '#f8fafc' }}>{user.name}</strong> ({user.email})
              </Typography>
            </Box>
          </Box>

          <Box className="flex items-center gap-3">
            <IconButton 
              onClick={toggleTheme} 
              color="primary" 
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>

            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Log Out
            </Button>
          </Box>
        </Box>

        {/* Content grid */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" className="font-bold mb-4">
                  Account Authority Level
                </Typography>
                <Box className="flex items-center gap-3 mb-4">
                  <Chip 
                    label={user.role} 
                    color={user.role === 'Admin' ? 'primary' : 'secondary'} 
                    className="font-bold"
                  />
                  <Typography variant="body2" color="text.secondary">
                    Role-based route guard checks this flag.
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  If you are logged in as an <strong>Admin</strong>, you can access the Admin panel. If you are a standard <strong>User</strong>, clicking the button below will trigger the route guard and redirect you to the Unauthorized page.
                </Typography>

                <Box className="mt-6">
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<ShieldIcon />}
                    onClick={() => navigate('/admin-insights')}
                  >
                    Go to Admin Insights
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" className="font-bold mb-4">
                  Next Implementation Steps (PR 3)
                </Typography>
                <Alert severity="success" className="mb-4">
                  Routing & Route Guards setup is working.
                </Alert>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Next, we will wire up Redux Toolkit to replace the temporary `localStorage` simulator with a secure global store, action slices, and async API thunks.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default Dashboard;
