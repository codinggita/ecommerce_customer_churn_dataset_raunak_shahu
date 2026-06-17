import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Button, Box, Stack } from '@mui/material';
import GppBadIcon from '@mui/icons-material/GppBad';
import ErrorIcon from '@mui/icons-material/Error';

export function Unauthorized() {
  const navigate = useNavigate();

  return (
    <Box className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <Card sx={{ maxWidth: 500, width: '100%', backdropFilter: 'blur(16px)', background: 'rgba(30, 41, 59, 0.8)' }}>
        <CardContent sx={{ p: 5, textAlign: 'center' }}>
          <Stack spacing={3} alignItems="center">
            <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'error.main', display: 'flex', justifyContent: 'center' }}>
              <GppBadIcon sx={{ fontSize: 48, color: 'error.contrastText' }} />
            </Box>
            
            <Box>
              <Typography variant="h5" className="font-bold text-slate-50" gutterBottom>
                Access Denied
              </Typography>
              <Typography variant="body2" className="text-slate-400">
                You do not have the required administrative permissions to access this specific module.
              </Typography>
            </Box>

            <Stack direction="row" spacing={2} className="w-full justify-center">
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => navigate('/')}
              >
                Go to Dashboard
              </Button>
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  navigate('/login');
                }}
              >
                Switch Account
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export function NotFound() {
  const navigate = useNavigate();

  return (
    <Box className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <Card sx={{ maxWidth: 500, width: '100%', backdropFilter: 'blur(16px)', background: 'rgba(30, 41, 59, 0.8)' }}>
        <CardContent sx={{ p: 5, textAlign: 'center' }}>
          <Stack spacing={3} alignItems="center">
            <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'warning.main', display: 'flex', justifyContent: 'center' }}>
              <ErrorIcon sx={{ fontSize: 48, color: 'warning.contrastText' }} />
            </Box>
            
            <Box>
              <Typography variant="h5" className="font-bold text-slate-50" gutterBottom>
                Page Not Found (404)
              </Typography>
              <Typography variant="body2" className="text-slate-400">
                The page you are trying to visit does not exist or has been relocated.
              </Typography>
            </Box>

            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate('/')}
            >
              Go to Dashboard
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
