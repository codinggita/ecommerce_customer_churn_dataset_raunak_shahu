import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Button, Box, Stack, Alert } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function AdminInsights() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <Box className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6">
      <Card sx={{ maxWidth: 600, width: '100%', bgcolor: 'rgba(30, 41, 59, 0.9)', color: 'white' }}>
        <CardContent sx={{ p: 5 }}>
          <Stack spacing={3}>
            <Box className="flex items-center gap-3">
              <AdminPanelSettingsIcon color="primary" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h5" className="font-bold">
                  Administrative Insights Area
                </Typography>
                <Typography variant="caption" color="text.secondary" className="text-slate-400">
                  Role Required: Admin
                </Typography>
              </Box>
            </Box>

            <Alert severity="success" sx={{ bgcolor: 'rgba(46, 125, 50, 0.1)', color: '#4caf50' }}>
              Access Granted! Your logged-in role is <strong>{user.role}</strong>.
            </Alert>

            <Typography variant="body2" className="text-slate-300">
              This panel represents protected admin intelligence. Standard user accounts cannot view this page and are automatically redirected to the Access Denied screen.
            </Typography>

            <Box className="pt-4">
              <Button 
                variant="outlined" 
                color="primary" 
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/')}
              >
                Back to Dashboard
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default AdminInsights;
